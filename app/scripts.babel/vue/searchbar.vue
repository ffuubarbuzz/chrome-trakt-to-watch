<template>
	<form class="searchbar" @submit.prevent="search">
		<input class="searchbar__input"
			type="search"
			v-model.trim="inputVal"
			@blur="sanitize"
		>
		<button class="searchbar__submit" :disabled="!isSubmittable">🔎</button>
	</form>
</template>

<script>
	import { mapState } from 'vuex';
	export default {
		data() {
			return {
				inputVal: this.query,
			};
		},
		methods: {
			search() {
				this._sendActionToCurrentTab('requestData', this.inputVal);
			},
			sanitize() {
				if (!this.inputVal) {
					this.inputVal = this.query;
				}
			},
		},
		computed: {
			isSubmittable() {
				return this.inputVal
				       && this.inputVal !== this.query;
			},
			...mapState(['query']),
		},
		watch: {
			query() {
				this.inputVal = this.query;
			},
		},
	};
</script>

<style>
	.searchbar {
		display: flex;
		align-items: stretch;
		height: 40px;
	}
	.searchbar__input {
		flex: 1 1 auto;
		-webkit-appearance: none;
		padding: 1em;
		border: 1px solid;
	}
	.searchbar__submit {
		background: none;
		border: none;
		width: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.searchbar__submit:disabled {
		background: lightgray;
	}
</style>
