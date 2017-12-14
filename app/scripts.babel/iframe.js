// 'use strict';

import Vue from 'vue';
import Iframe from './vue/iframe.vue';
import moment from '../bower_components/moment/moment.js';

Vue.filter('formatDate', function(value, momentFormat) {
	if (value) {
		return moment(String(value)).format(momentFormat);
	}
});

const app = new Vue({
	el: '#app',
	render: function(c) { 
		return c(Iframe, {
			props: {
				items: this.items,
				queryStr: this.queryStr,
			},
		})
	},
	data: {
		items: [],
		queryStr: '',
	},
	updated: _setIframeHeight,
});

window.addEventListener('message', event => {
	Object.assign(app, event.data);
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
	_sendActionToCurrentTab('setIframeHeight', document.documentElement.scrollHeight);
}
