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


const actions = {
	showIframe,
	requestData,
	closeIframe: _unattachIframe,
	setIframeHeight,
};

chrome.runtime.onMessage.addListener(request => {
	console.log('contentscript recieved request: ', request)
	actions[request.action](request.payload);
});

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

function requestData() {
	iframe.contentWindow.postMessage(iframeDataCached, '*');
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
