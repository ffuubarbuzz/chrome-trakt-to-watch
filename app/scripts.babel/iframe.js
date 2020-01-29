'use strict';

import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import VueIco, {
	icoClose,
	icoSettingsApplications,
} from 'vue-ico'
import Iframe from './vue/iframe.vue';
import translationComponent from './vue/translation.vue';
import moment from 'moment';
import router from './iframe/router.js';
import storeConfig from './iframe/store-config.js';

Vue.use(Vuex);
Vue.use(VueRouter);
Vue.use(VueIco, {
  close: icoClose,
  settingsApplications: icoSettingsApplications,
});

const store = new Vuex.Store(storeConfig);

const messageHandlers = {
	error: showError,
	results: showResults,
	loading: showLoading,
	watchlist: markResultsInWatchlist,
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

Vue.component('trans-late', translationComponent);

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

function showError(error) {
	store.commit('addError', error);
}

function showResults(results) {
	store.commit('cleanErrors');
	store.commit('setItemsOrder', results.items.map(item => item.id));
	store.commit('setItems', results.items.reduce((memo, value) => {
		memo[value.id] = Object.assign({
			isLoading: false,
			isInWatchlist: false,
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

function markResultsInWatchlist(watchlist) {
	store.commit('markResultsInWatchlist', watchlist);
}

function _sendActionToCurrentTab(action, payload) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {action, payload});
	});
}

function _setIframeHeight() {
	// _sendActionToCurrentTab('setIframeHeight', document.documentElement.scrollHeight);
}
