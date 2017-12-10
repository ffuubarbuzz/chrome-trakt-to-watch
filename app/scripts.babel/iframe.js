// 'use strict';

import Vue from 'vue';
import Iframe from './vue/iframe.vue';

const app = new Vue({
	el: '#app',
	render: function(c) { 
		return c(Iframe, {
			props: {
				items: this.items
			},
		})
	},
	data: {
		items: []
	},
	updated: _setIframeHeight,
});

window.addEventListener('message', event => {
	app.items = event.data;
});

window.addEventListener('load', event => {
	_setIframeHeight();
});

window.addEventListener('DOMContentLoaded', event => {
	_setIframeHeight();
	_sendActionToCurrentTab('requestData');
});

function _sendActionToCurrentTab(action, payload) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {action, payload});
	});
}

function _setIframeHeight() {
	_sendActionToCurrentTab('setIframeHeight', document.documentElement.offsetHeight);
}

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	chrome.tabs.sendMessage(tabs[0].id, {
		action: 'requestData'
	});
});
