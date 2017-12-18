'use strict';

import moment from 'moment';

const TMDB_API_KEY = '1423559168fef1697183d16836a6019b';
const TRAKT_API_CONFIG = {
	CLIENT_ID: '8988a8bf210a06fd030cbb614bab6a384d0bbeb42c6d3e91d02e8205842a810d',
	CLIENT_SECRET: '563bb19a2b86d6335d607369298bee63aec5c87921f4d5649bfe384cb88fa394',
	REDIRECT_URL: chrome.identity.getRedirectURL('provider_cb'),
	get authorizeUrl() {
		return `https://api.trakt.tv/oauth/authorize?response_type=code&client_id=${encodeURIComponent(this.CLIENT_ID)}&redirect_uri=${encodeURIComponent(this.REDIRECT_URL)}`;
	},
};

const TRAKT_GRANT_TYPE_CREDENTIAL_NAMES = {
	// these strings come from Trakt API
	'authorization_code': 'code',
	'refresh_token': 'refresh_token',
}

const messageHandlers = {
	addToWatchlist,
	authorizeTrakt,
	unauthorizeTrakt,
};

chrome.runtime.onInstalled.addListener(details => {
	console.log('previousVersion', details.previousVersion);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (!message.type
	    || !messageHandlers[message.type]
	    || typeof messageHandlers[message.type] !== 'function') {
		return;
	}
	messageHandlers[message.type](message.payload, sendResponse);
	return true;
});

const contextMenuID = chrome.contextMenus.create({
	contexts: ['selection'],
	title: 'Add movie to watchlist',
	onclick: _contextMenuClick,
});

function _contextMenuClick(info) {
	_multiSearch(info.selectionText);
}

function _multiSearch(query) {
	const queryTerm = encodeURIComponent(query);
	const queryURL = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${queryTerm}`;
	fetch(queryURL)
		.then(response => {
			if (response.ok) {
				return response.json();
			}
			throw new Error('Network error');
		})
		.then(json => {
			_sendActionToCurrentTab('showIframe', {
				type: 'results',
				payload: {
					query,
					items: json.results,
				},
			});
		})
		.catch(function(error) {
			_sendActionToCurrentTab('showIframe', {
				type: 'error',
				payload: `There has been a problem with your fetch operation: ${error.message}`,
			});
		});
}

function _sendActionToCurrentTab(action, payload) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {action, payload});
	});
}

function _sendToTrakt(traktId) {

	chrome.storage.sync.get([
		'accessToken',
		'refreshToken',
		'tokenExpirationDate',
	], result => {
		const {
			accessToken,
			refreshToken,
			tokenExpirationDate,
		} = result;
		if (!accessToken
		    || !refreshToken
		    || _isDateExpired(tokenExpirationDate)) {
			chrome.runtime.openOptionsPage();
		} else {
			fetch('https://api.trakt.tv/sync/watchlist', {
				method: 'POST',
				headers: new Headers({
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${accessToken}`,
					'trakt-api-version': '2',
					'trakt-api-key': TRAKT_API_CONFIG.CLIENT_ID,
				}),
				body: JSON.stringify({
					movies: [
						{
							ids: {
								tmdb: traktId
							}
						}
					],
				}),
			}).then(response => {
				return response.json()
			}).then(json => {console.log(json)});
		}
	});
}

function _saveTraktAccessToken(url) {
	const params = new URLSearchParams(url.match(/^(.*?)(\?.*?)$/)[2]);
	const token = params.get('code');
	chrome.storage.sync.set({traktAccessToken: token});
}

function addToWatchlist(itemId) {
	_sendToTrakt(itemId);
	_sendActionToCurrentTab('closeIframe');
}

function authorizeTrakt(payload, sendResponse) {
	chrome.storage.sync.get([
		'accessToken',
		'refreshToken',
		'TokenExpirationDate',
	], result => {
		const {
			traktAccessToken,
			traktRefreshToken,
			traktTokenExpirationDate,
		} = result;
		if (!traktAccessToken || !traktRefreshToken) {
			chrome.identity.launchWebAuthFlow({
				url: TRAKT_API_CONFIG.authorizeUrl,
				'interactive': true,
			}, url => {
				if (!url) {
					sendResponse('failed');
					return;
				}
				const params = new URLSearchParams(url.match(/^(.*?)(\?.*?)$/)[2]);
				const code = params.get('code');
				_obtainTraktTokens('authorization_code', code);
			});
		}  else if (_isDateExpired(traktTokenExpirationDate)) {
			_obtainTraktTokens('refresh_token', traktRefreshToken);
		}
	});
}

function unauthorizeTrakt() {
	//todo: implement
}

function _obtainTraktTokens(grantType, credential) {
	fetch('https://api.trakt.tv/oauth/token', {
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
	}).then(response => {
		return response.json()
	}).then(json => {
		const storageData = {
			accessToken: json.access_token,
			tokenExpirationDate: moment().add(json.expires_in, 's').valueOf()
		};
		if (grantType === 'authorization_code') {
			storageData['refreshToken'] = json.refresh_token;
		}
		chrome.storage.sync.set(storageData);
	});
}

function _isDateExpired(ms) {
	return moment(ms).isBefore();
}
