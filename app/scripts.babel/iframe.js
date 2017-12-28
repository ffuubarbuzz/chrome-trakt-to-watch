'use strict';

import Vue from 'vue';
import Vuex from 'vuex';
import Iframe from './vue/iframe.vue';
import moment from 'moment';

Vue.use(Vuex);

const initialState = {
	items: {},
	itemsOrder: [],
	selectedItem: null,
	errors: [],
	query: '',
};

const store = new Vuex.Store({
	state: Object.assign({}, initialState),
	mutations: {
		reset (state) {
			for (let prop in state) {
				state[prop] = initialState[prop];
			}
		},
		setItems (state, items) {
			state.items = items;
		},
		setItemsOrder (state, itemsOrder) {
			state.itemsOrder = itemsOrder;
		},
		setQuery (state, query) {
			state.query = query;
		},
		cleanErrors (state) {
			state.errors = [];
		},
		addError (state, message) {
			state.errors.push(message);
		},
		removeError (state, index) {
			Vue.delete(state.errors, index);
		},
		setSelectedItem (state, itemId) {
			state.selectedItem = itemId;
		},
		setItemLoading (state, itemId) {
			state.items[itemId].isLoading = true;
		},
		setItemNotLoading (state, itemId) {
			state.items[itemId].isLoading = false;
		},
	},
	getters: {
		// isAuthorized (state) {
		// 	return state.traktAuth.accessToken && state.traktAuth.refreshToken;
		// },
	},
	actions: {
		selectItem ({commit}, itemId) {
			commit('setSelectedItem', itemId);
		},
	}
});

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
}

function showLoading() {
	store.commit('reset');
}

function _sendActionToCurrentTab(action, payload) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {action, payload});
	});
}

function _setIframeHeight() {
	// _sendActionToCurrentTab('setIframeHeight', document.documentElement.scrollHeight);
}
