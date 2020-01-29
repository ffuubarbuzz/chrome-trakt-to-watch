'use strict';

let iframe;
let isIframeAttached = false;
let iframeDataCached = {};
const iframeStyles = `
	position: fixed;
	top: 10px;
	right: 10px;
	width: 348px;
	height: 495px;
	border: none;
	z-index: 2147483647;
`;
const enhanceButtonStyles = `
	background: none;
	border: none;
	margin: 0 0 0 .2em;
	padding: 0;
	vertical-align: middle;
`;


const actions = {
	showIframe,
	requestData,
	closeIframe: _unattachIframe,
	setIframeHeight,
};

chrome.runtime.onMessage.addListener(request => {
	actions[request.action](request.payload);
});

maybeEnhancePage();

function showIframe(payload) {
	Object.assign(iframeDataCached, payload);
	if (!iframe) {
		iframe = _createIframe();
	}
	if (!isIframeAttached) {
		_attachIframe();
		document.addEventListener('keydown', event => {
			event.key === 'Escape' && _unattachIframe();
		}, {once: true});
		document.addEventListener('click', _unattachIframe, {once: true});
	} else {
		iframe.contentWindow.postMessage(payload, '*');
	}
}

function requestData(query) {
	if (query) {
		chrome.runtime.sendMessage({
			type: 'search',
			target: 'background',
			payload: {
				query,
			},
		});
	} else {
		iframe.contentWindow.postMessage(iframeDataCached, '*');
	}
}

function setIframeHeight(height) {
	iframe && (iframe.style.height = `${height}px`);
}

function _createIframe() {
	let iframe = document.createElement('iframe');
	iframe.src = chrome.extension.getURL('iframe.html');
	iframe.setAttribute('style', iframeStyles);
	return iframe;
}

function _attachIframe() {
	document.body.appendChild(iframe);
	isIframeAttached = true;
}

function _unattachIframe() {
	document.body.removeChild(iframe);
	isIframeAttached = false;
}

function maybeEnhancePage() {
	const hasMovie = document.querySelector('[data-attrid^="kc:/film/film"]');
	const hasShow = !hasMovie && document.querySelector('[data-attrid^="kc:/tv/tv_program"]');
	if (!hasMovie && !hasShow) {
		return;
	}
	const nameContainer = document.querySelector('[data-attrid="title"]');
	if (!nameContainer) {
		return;
	}
	const name = nameContainer.innerText;
	if (!name) {
		return;
	}
	const button = document.createElement('button');
	const icon = document.createElement('img');
	icon.setAttribute('src', chrome.runtime.getURL('images/playlist_add-24px.svg'));
	button.append(icon);
	button.setAttribute('style', enhanceButtonStyles);
	button.setAttribute('title', 'Add to your trakt.tv watchlist');
	nameContainer.append(button);
	button.addEventListener('click', () => {
		chrome.runtime.sendMessage({
			type: 'search',
			target: 'background',
			payload: {
				query: name,
				category: hasMovie ? 'movie' : 'tv',
			},
		});
	});
}