'use strict';
import Vue from 'vue';
import Vuex from 'vuex';
import Options from './vue/options.vue';

Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		traktAuth: {
			isBusy: true,
			accessToken: '',
			refreshToken: '',
		},
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
				type: 'authorizeTrakt',
			}, response => {
				if (response === 'failed') {
					_authFailed();
				}
				commit('setTraktAuthBusy', false);
			});
			commit('setTraktAuthBusy', true);
		},
		unauthorize ({commit}) {
			chrome.runtime.sendMessage({
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
			commit('setTraktAccessToken', storageChange.newValue);
		}
	}
});

function _authFailed() {
	//todo: implement
	console.log('auth failed!');
}