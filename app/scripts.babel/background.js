'use strict';

const theMovieDbApiKey = '1423559168fef1697183d16836a6019b';
const traktAPIConfig = {
	clientId: '8988a8bf210a06fd030cbb614bab6a384d0bbeb42c6d3e91d02e8205842a810d',
	clientSecret: '563bb19a2b86d6335d607369298bee63aec5c87921f4d5649bfe384cb88fa394',
	redirectUrl: chrome.identity.getRedirectURL('provider_cb'),
}

const actions = {
	select
};

let accessToken = '';

chrome.runtime.onInstalled.addListener(details => {
	console.log('previousVersion', details.previousVersion);
});

chrome.runtime.onMessage.addListener(request => {
	actions[request.action](request.payload);
});

const contextMenuID = chrome.contextMenus.create({
	contexts: ['selection'],
	title: 'Add movie to watchlist',
	onclick: _contextMenuClick,
});

function _contextMenuClick(info) {
	const queryStr = info.selectionText;
	const queryTerm = encodeURIComponent(queryStr);
	const queryURL = `https://api.themoviedb.org/3/search/movie?api_key=${theMovieDbApiKey}&query=${queryTerm}`;
	fetch(queryURL).then(response => {
		return response.json();
	}).then(json => {
		_sendActionToCurrentTab('showSearchResults', {
			queryStr,
			items: json.results,
		});
	});
}

function _sendActionToCurrentTab(action, payload) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {action, payload});
	});
}

function _sendToTrakt(traktId) {
	const authorizeUrl = `https://api.trakt.tv/oauth/authorize?response_type=code&client_id=${encodeURIComponent(traktAPIConfig.clientId)}&redirect_uri=${encodeURIComponent(traktAPIConfig.redirectUrl)}`;
	chrome.identity.launchWebAuthFlow({
		url: authorizeUrl,
		'interactive':true
	}, url => {
		const params = new URLSearchParams(url.match(/^(.*?)(\?.*?)$/)[2]);
		const code = params.get('code');
		// https://api.trakt.tv/users/settings
		fetch('https://api.trakt.tv/oauth/token', {
			method: 'POST',
			headers: new Headers({
				'Content-Type': 'application/json',
			}),
			body: JSON.stringify({
				code,
				'client_id': traktAPIConfig.clientId,
				'client_secret': traktAPIConfig.clientSecret,
				'redirect_uri': traktAPIConfig.redirectUrl,
				'grant_type': 'authorization_code'
			}),
		}).then(response => {
			return response.json()
		}).then(json => {
			accessToken = json.access_token;
			return fetch('https://api.trakt.tv/sync/watchlist', {
				method: 'POST',
				headers: new Headers({
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${accessToken}`,
					'trakt-api-version': '2',
					'trakt-api-key': traktAPIConfig.clientId,
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
			});
		}).then(response => {
			return response.json()
		}).then(json => {console.log(json)});
	});
}

function select(itemId) {
	// const searchTerm = encodeURIComponent(itemId);
	// const queryURL = `https://api.themoviedb.org/3/movie/${searchTerm}?api_key=${theMovieDbApiKey}`;
	// fetch(queryURL).then(response => {
	// 	return response.json();
	// }).then(json => {
	// 	_sendToTrakt(json.imdb_id);
	// 	_sendActionToCurrentTab('closeIframe');
	// });
	_sendToTrakt(itemId);
	_sendActionToCurrentTab('closeIframe');
}
