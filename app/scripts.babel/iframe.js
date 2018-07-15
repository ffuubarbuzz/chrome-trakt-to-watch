'use strict';

import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import Iframe from './vue/iframe.vue';
import moment from 'moment';
import router from './iframe/router.js';
import storeConfig from './iframe/store-config.js';

Vue.use(Vuex);
Vue.use(VueRouter);

const store = new Vuex.Store(storeConfig);

const messageHandlers = {
	error: showError,
	results: showResults,
	loading: showLoading,
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
	render: c => c(Iframe),
	store,
	router,
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

function showError(message) {
	store.commit('addError', message);
}

function showResults(results) {
	store.commit('cleanErrors');
	store.commit('setItemsOrder', results.items.map(item => item.id));
	store.commit('setItems', results.items.reduce((memo, value) => {
		memo[value.id] = Object.assign({
			isLoading: false,
		}, value);
		return memo;
	}, {}));
	store.commit('setQuery', results.query);
	app.$router.push(`/search/${results.query}`);
}

function showLoading() {
	store.commit('reset');
	app.$router.push('/');
}

function _sendActionToCurrentTab(action, payload) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {action, payload});
	});
}

function _setIframeHeight() {
	// _sendActionToCurrentTab('setIframeHeight', document.documentElement.scrollHeight);
}
