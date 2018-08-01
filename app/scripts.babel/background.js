'use strict';

import moment from 'moment';
import TranslatedError from './translated_error.js';

const TMDB_API_KEY = '1423559168fef1697183d16836a6019b';
const TRAKT_API_CONFIG = Object.freeze({
	CLIENT_ID: '8988a8bf210a06fd030cbb614bab6a384d0bbeb42c6d3e91d02e8205842a810d',
	CLIENT_SECRET: '563bb19a2b86d6335d607369298bee63aec5c87921f4d5649bfe384cb88fa394',
	REDIRECT_URL: chrome.identity.getRedirectURL('provider_cb'),
	get authorizeUrl() {
		return `https://api.trakt.tv/oauth/authorize?response_type=code&client_id=${encodeURIComponent(this.CLIENT_ID)}&redirect_uri=${encodeURIComponent(this.REDIRECT_URL)}`;
	},
});
const CONTEXT_MENU_ITEM_ID = 'trakt_watchlist_ext';
const TRAKT_CREDENTIALS_EMPTY = Object.freeze({
	accessToken: false,
	refreshToken: false,
	tokenExpirationDate: false,
});
const traktCredentials = Object.assign({}, TRAKT_CREDENTIALS_EMPTY);

const TRAKT_GRANT_TYPE_CREDENTIAL_NAMES = {
	// these strings come from Trakt API
	'authorization_code': 'code',
	'refresh_token': 'refresh_token',
}

const TRAKT_MEDIA_TYPE_TO_WATCHLIST = {
	// these strings come from Trakt API
	'movie': 'movies',
	'tv': 'shows',
}

const messageHandlers = {
	addToWatchlist,
	authorizeTrakt,
	unauthorizeTrakt,
	getTranslation,
};

chrome.runtime.onInstalled.addListener(details => {
	_readTraktAuth()
		.catch(console.log);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (!message.type
	    || !messageHandlers[message.type]
	    || typeof messageHandlers[message.type] !== 'function'
	    || message.target !== 'background') {
		return;
	}
	messageHandlers[message.type](message.payload, sendResponse);
	return true;
});

chrome.contextMenus.removeAll();
chrome.contextMenus.create({
	contexts: ['selection'],
	title: 'Add movie to watchlist',
	id: CONTEXT_MENU_ITEM_ID,
});

chrome.contextMenus.onClicked.addListener(_contextMenuClick);

function _readTraktAuth() {
	return new Promise((resolve, reject) => {
		if (traktCredentials.accessToken
		    && traktCredentials.refreshToken
		    && traktCredentials.tokenExpirationDate) {
			return resolve(traktCredentials);
		}
		chrome.storage.sync.get([
			'accessToken',
			'refreshToken',
			'tokenExpirationDate',
		], result => {
			if (chrome.runtime.lastError) {
				return reject(chrome.runtime.lastError.message);
			}
			const {
				accessToken,
				refreshToken,
				tokenExpirationDate,
			} = result;
			const authObj = {
				accessToken,
				refreshToken,
				tokenExpirationDate,
			};
			if (accessToken && refreshToken && tokenExpirationDate) {
				Object.assign(traktCredentials, authObj);
				return resolve(authObj);
			} else {
				return reject();
			}
		});
	});
}

function _contextMenuClick(info) {
	if (info.menuItemId !== CONTEXT_MENU_ITEM_ID) {
		return;
	}
	_multiSearch(info.selectionText);
	_sendActionToCurrentTab('showIframe', {
		type: 'loading',
	});
}

function _multiSearch(query) {
	const queryTerm = encodeURIComponent(query);
	const queryURL = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${queryTerm}`;
	fetch(queryURL)
		.then(_parseJSONResponse)
		.then(_showResults.bind(undefined, query))
		.catch(_showError);
}

function _sendActionToCurrentTab(action, payload) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {action, payload});
	});
}

function _refreshTraktTokenIfNeeded(authObj) {
	return new Promise((resolve, reject) => {
		if (_isDateExpired(authObj.tokenExpirationDate)) {
			return _getTraktAuthTokens({
				grantType: 'refresh_token',
				credential: authObj.traktRefreshToken,
			}).then(_storeTraktAuth)
		} else {
			return resolve(authObj);
		}
	});
}

function _sendToTrakt(item) {
	return _readTraktAuth()
		.then(_refreshTraktTokenIfNeeded)
		.then(authObj => {
			return fetch('https://api.trakt.tv/sync/watchlist', {
				method: 'POST',
				headers: new Headers({
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${authObj.accessToken}`,
					'trakt-api-version': '2',
					'trakt-api-key': TRAKT_API_CONFIG.CLIENT_ID,
				}),
				body: JSON.stringify({
					[TRAKT_MEDIA_TYPE_TO_WATCHLIST[item.type]]: [
						{
							ids: {
								tmdb: item.id
							}
						}
					],
				}),
			});
		}).then(_parseJSONResponse)
		.catch(error => {
			return _cleanTraktAuth()
				.then(() => {
					throw new TranslatedError('errorTraktNotAuthorized');
				});
		});
}

function addToWatchlist(item, sendResponse, isRetry) {
	return _sendToTrakt(item)
		.then(json => {
			// todo: validate what's added
			//json.added vs json.not_found
			sendResponse({
				success: true,
			});
		})
		.catch(error => {
			if (isRetry) {
				sendResponse({
					success: false,
					error,
				});
				return;
			}
			authorizeTrakt(undefined, sendResponse)
				.then(() => {
					addToWatchlist(item, sendResponse, true);
				});
		});
	;
}

function authorizeTrakt(payload, sendResponse) {
	return _readTraktAuth()
		.then(_refreshTraktTokenIfNeeded)
		.catch(() => {
			return _getTraktAuthCode()
				.then(_getTraktAuthTokens)
				.then(_storeTraktAuth)
				.catch(error => {
					sendResponse({
						status: 'fail',
						error,
					});
				});
		});
}

function unauthorizeTrakt() {
	_readTraktAuth()
		.then(_revokeToken.bind(undefined, 'refreshToken'))
		.then(_revokeToken.bind(undefined, 'accessToken'))
		.then(_cleanTraktAuth)
		.catch(console.error);
}

function getTranslation(payload, sendResponse) {
	sendResponse(chrome.i18n.getMessage(payload.tag, payload.substitutions));
}

function _revokeToken(tokenName, authObj) {
	if (!authObj.accessToken) {
		reject(new Error('Revoke token failed, access token needed is absent'));
	}
	const body = new FormData();
	body.set('token', authObj[tokenName]);
	return fetch('https://api.trakt.tv/oauth/revoke', {
		headers: new Headers({
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': `Bearer ${authObj.accessToken}`,
			'trakt-api-version': '2',
			'trakt-api-key': TRAKT_API_CONFIG.CLIENT_ID,
		}),
		method: 'POST',
		body,
	}).then(_parseJSONResponse)
	.then(() => {
		chrome.identity.removeCachedAuthToken({
			token: authObj[tokenName],
		});
	})
	.then(json => {
		return authObj;
	});
}

function _getTraktAuthCode() {
	return new Promise((resolve, reject) => {
		chrome.identity.launchWebAuthFlow({
			url: TRAKT_API_CONFIG.authorizeUrl,
			'interactive': true,
		}, url => {
			if (chrome.runtime.lastError) {
				return reject(chrome.runtime.lastError);
			}
			if (!url) {
				return reject(new TranslatedError('errorTraktAuthFailed'));
			}
			const params = new URLSearchParams(url.match(/^(.*?)(\?.*?)$/)[2]);
			const code = params.get('code');
			const error = params.get('error');
			if (error && !code) {
				return reject(new TranslatedError('errorTraktAuthRejected'));
			}
			return resolve({
				grantType: 'authorization_code',
				credential: code,
			});
		});
		
	});
}

function _showResults(query, json) {
	if (!json.results) {
		throw new Error('TMDB search gave results in unexpected format');
	}
	_sendActionToCurrentTab('showIframe', {
		type: 'results',
		payload: {
			query,
			items: json.results,
		},
	});
}

function _showItemAdded(json, item) {

	// todo: validate what's added, probably with another method before this one
	//json.added vs json.not_found
	// _sendActionToCurrentTab('showIframe', {
	// 	type: 'added',
	// 	payload: item.id,
	// });
	// if (!json.results) {
	// 	throw new Error('TMDB search gave results in unexpected format');
	// }
}

function _showError( error) {
	_sendActionToCurrentTab('showIframe', {
		type: 'error',
		payload: error,
	});
}

function _getTraktAuthTokens(authObj) {
	const {grantType, credential} = authObj;
	const fetchParams = {
		method: 'POST',
		headers: new Headers({
			'Content-Type': 'application/json',
		}),
		body: JSON.stringify({
			[TRAKT_GRANT_TYPE_CREDENTIAL_NAMES[grantType]]: credential,
			'client_id': TRAKT_API_CONFIG.CLIENT_ID,
			'client_secret': TRAKT_API_CONFIG.CLIENT_SECRET,
			'redirect_uri': TRAKT_API_CONFIG.REDIRECT_URL,
			'grant_type': grantType,
		}),
	};
	return fetch('https://api.trakt.tv/oauth/token', fetchParams)
		.then(_parseJSONResponse)
		.then(json => {
			const authObj = {
				accessToken: json.access_token,
				refreshToken: json.refresh_token,
				tokenExpirationDate: moment().add(json.expires_in, 's').valueOf(),
			};
			return authObj;
		});
}

function _storeTraktAuth(authObj) {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.set(authObj, () => {
			if (chrome.runtime.lastError) {
				return reject(chrome.runtime.lastError.message);
			}
			return resolve();
		});
	});
}

function _cleanTraktAuth() {
	return new Promise((resolve, reject) => {
		Object.assign(traktCredentials, TRAKT_CREDENTIALS_EMPTY);
		chrome.storage.sync.set(traktCredentials, () => {
			if (chrome.runtime.lastError) {
				return reject(chrome.runtime.lastError.message);
			}
			return resolve();
		});
	});
}

function _parseJSONResponse(response) {
	if (response.ok) {
		return response.json();
	}
	if (response.status === 401) {
		throw new Error(`Unauthorized request to ${response.url}`);
	}
	throw new Error(`Network error: ${response.statusText}`);
}

function _isDateExpired(ms) {
	return moment(ms).isBefore();
}
