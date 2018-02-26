const initialState = {
	items: {},
	itemsOrder: [],
	errors: [],
	query: '',
};

export default {
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
		// selectItem ({commit}, itemId) {
		// 	commit('setSelectedItem', itemId);
		// },
	}
};
