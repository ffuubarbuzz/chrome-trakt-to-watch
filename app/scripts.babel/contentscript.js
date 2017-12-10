'use strict';

let iframe;
let isIframeAttached = false;
let resultsCached = [];

const actions = {
	addToWatchList,
	requestData,
	closeIframe: _unattachIframe,
};

chrome.runtime.onMessage.addListener(request => {
	actions[request.action](request.payload);
});

function addToWatchList(results) {
	resultsCached = results;
	if (!iframe) {
		iframe = _createIframe();
	}
	if (!isIframeAttached) {
		_attachIframe();
	}
	iframe.contentWindow.postMessage(results, '*');
}

function requestData() {
	iframe.contentWindow.postMessage(resultsCached, '*');
}

function _createIframe() {
	let iframe = document.createElement('iframe');
	iframe.src = chrome.extension.getURL('iframe.html');
	iframe.setAttribute('style', 'position: fixed; top: 10px; right: 10px; width: 300px; height: 300px; z-index: 2147483647;');
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
