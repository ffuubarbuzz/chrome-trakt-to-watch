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
	}
});

window.addEventListener('message', event => {
	app.items = event.data;
});

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	chrome.tabs.sendMessage(tabs[0].id, {
		action: 'requestData'
	});
});
