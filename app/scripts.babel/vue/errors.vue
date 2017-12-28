<template>
	<ul class="errors" v-if="errors.length">
		<li class="errors__item error"
		    v-for="(message, index) in errors">
			{{ message }}
			<div @click="removeError(index)" class="error__close">✕</div>
		</li>
	</ul>
</template>

<script>
	import { mapState } from 'vuex';
	export default {
		computed: mapState(['errors']),
		methods: {
			removeError (index) {
				this.$store.commit('removeError', index);
			}
		}
	};
</script>

<style>
	.errors {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.error {
		background: firebrick;
		color: #fff;
		padding: .2em  0 .2em 1em;
		display: flex;
		align-items: center;
	}
	.error__close {
		margin-left: auto;
		font-size: 12px;
		width: 24px;
		height: 24px;
		line-height: 24px;
		cursor: default;
	}
</style>