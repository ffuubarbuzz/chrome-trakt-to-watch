'use strict';

const theMovieDbApiKey = '1423559168fef1697183d16836a6019b';

const actions = {
	select
};

chrome.runtime.onInstalled.addListener(details => {
	console.log('previousVersion', details.previousVersion);
});

chrome.runtime.onMessage.addListener(request => {
	console.log('onMessage: ', request)
	actions[request.action](request.payload);
});

const contextMenuID = chrome.contextMenus.create({
	contexts: ['selection'],
	title: 'Add movie to watchlist',
	onclick: _contextMenuClick,
});

function _contextMenuClick(info) {
	const searchTerm = encodeURIComponent(info.selectionText);
	const queryURL = `https://api.themoviedb.org/3/search/movie?api_key=${theMovieDbApiKey}&query=${searchTerm}`;
	fetch(queryURL).then(response => {
		return response.json();
	}).then(json => {
		_sendActionToCurrentTab('addToWatchList', json.results)
	});
}

function _sendActionToCurrentTab(action, payload) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {action, payload});
	});
}

function select(itemId) {
	const searchTerm = encodeURIComponent(itemId);
	const queryURL = `https://api.themoviedb.org/3/movie/${searchTerm}?api_key=${theMovieDbApiKey}`;
	fetch(queryURL).then(response => {
		return response.json();
	}).then(json => {
		console.log('imdb id', json.imdb_id);
		_sendActionToCurrentTab('closeIframe');
	});
}
