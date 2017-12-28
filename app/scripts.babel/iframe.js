// 'use strict';

import Vue from 'vue';
import Iframe from './vue/iframe.vue';
import moment from 'moment';

const messageHandlers = {
	error: showError,
	results: showResults,
}

Vue.filter('formatDate', function(value, momentFormat) {
	if (value) {
		return moment(String(value)).format(momentFormat);
	}
});

Vue.mixin({
	methods: {
		_sendActionToCurrentTab(action, payload) {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {action, payload});
			});
		},
	},
});

const app = new Vue({
	el: '#app',
	render: function(c) { 
		return c(Iframe, {
			props: {
				items: this.items,
				errors: this.errors,
				query: this.query,
			},
		})
	},
	data: {
		items: [],
		errors: [],
		query: '',
	},
	updated: _setIframeHeight,
});

window.addEventListener('message', event => {
	if (!event.data.type
	    || !messageHandlers[event.data.type]
	    || typeof messageHandlers[event.data.type] !== 'function') {
		return;
	}
	messageHandlers[event.data.type](event.data.payload);
});

window.addEventListener('load', event => {
	_setIframeHeight();
});

window.addEventListener('DOMContentLoaded', event => {
	_setIframeHeight();
	_sendActionToCurrentTab('requestData');
});

function showError(payload) {
	app.errors.push(payload);
}

function showResults(payload) {
	Object.assign(app, payload);
}

function _sendActionToCurrentTab(action, payload) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {action, payload});
	});
}

function _setIframeHeight() {
	// _sendActionToCurrentTab('setIframeHeight', document.documentElement.scrollHeight);
}
