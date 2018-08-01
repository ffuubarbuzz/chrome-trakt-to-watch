'use strict';
import Vue from 'vue';
import Vuex from 'vuex';
import Options from './vue/options.vue';
import translationComponent from './vue/translation.vue';

Vue.use(Vuex);

Vue.component('trans-late', translationComponent);

const messageHandlers = {
	showMessage,
};

const store = new Vuex.Store({
	state: {
		traktAuth: {
			isBusy: true,
			accessToken: '',
			refreshToken: '',
		},
		messages: [],
	},
	mutations: {
		setTraktAccessToken (state, token) {
			state.traktAuth.accessToken = token;
		},
		setTraktRefreshToken (state, token) {
			state.traktAuth.refreshToken = token;
		},
		setTraktAuthBusy (state, isBusy) {
			state.traktAuth.isBusy = isBusy;
		},
		addMessage(state, message) {
			state.messages.push(message);
		},
		removeMessage(state, messageIndex) {
			if (messageIndex > state.messages.length - 1) {
				return;
			}
			state.messages.splice(messageIndex, 1);
		},
	},
	getters: {
		isAuthorized (state) {
			return state.traktAuth.accessToken && state.traktAuth.refreshToken;
		},
	},
	actions: {
		readAuthTokens ({commit}) {
			commit('setTraktAuthBusy', true);
			chrome.storage.sync.get(['accessToken', 'refreshToken'], (result) => {
				const {accessToken, refreshToken} = result;
				if (accessToken && refreshToken) {
					commit('setTraktAccessToken', accessToken);
					commit('setTraktRefreshToken', refreshToken);
				}
				commit('setTraktAuthBusy', false);
			});
		},
		authorize ({commit}) {
			chrome.runtime.sendMessage({
				target: 'background',
				type: 'authorizeTrakt',
			}, response => {
				if (response.status === 'fail') {
					_authFailed();
				}
				commit('setTraktAuthBusy', false);
			});
			commit('setTraktAuthBusy', true);
		},
		unauthorize ({commit}) {
			chrome.runtime.sendMessage({
				target: 'background',
				type: 'unauthorizeTrakt',
			});
			commit('setTraktAuthBusy', true);
		},
	}
});

const app = new Vue({
	el: '#app',
	store,
	render: (c) => c(Options),
});

store.dispatch('readAuthTokens');

chrome.storage.onChanged.addListener((changes, namespace) => {
	for (let key in changes) {
		if (key === 'accessToken' || key === 'refreshToken') {
			store.commit('setTraktAuthBusy', false);
		}
		let storageChange = changes[key];
		if (key === 'accessToken') {
			store.commit('setTraktAccessToken', storageChange.newValue);
		}
	}
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (!message.type
	    || !messageHandlers[message.type]
	    || typeof messageHandlers[message.type] !== 'function'
	    || message.target !== 'options') {
		return;
	}
	messageHandlers[message.type](message.payload, sendResponse);
	return true;
});

function showMessage(message) {
	store.commit('addMessage', message);
}

function _authFailed() {
	//todo: implement
	console.log('auth failed!');
}