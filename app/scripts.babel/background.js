'use strict';

const theMovieDbApiKey = '1423559168fef1697183d16836a6019b';

chrome.runtime.onInstalled.addListener(details => {
	console.log('previousVersion', details.previousVersion);
});

const contextMenuID = chrome.contextMenus.create({
	contexts: ['selection'],
	title: 'Add movie to watchlist',
	onclick: searchForMovie,
});

function searchForMovie(info) {
	const searchTerm = encodeURIComponent(info.selectionText);
	const queryURL = `https://api.themoviedb.org/3/search/movie?api_key=${theMovieDbApiKey}&query=${searchTerm}`;
	fetch(queryURL).then(response => {
		return response.json();
	}).then(json => {
		json.results.forEach(movie => {
			console.log(movie);
			chrome.contextMenus.create({
				contexts: ['selection'],
				title: movie.title,
				parentId: contextMenuID,
				onclick: () => {console.log(movie.id)},
			})
		});
	});
}
