<template>
	<main class="main">
		<HeadBar class="main__head" />
		<Errors v-if="errors.length" />
		<div class="main__content">
			<router-view />
		</div>
	</main>
</template>

<script>
	import HeadBar from './head.vue';
	import Errors from './errors.vue';
	import { mapState } from 'vuex';
	export default {
		components: {
			HeadBar,
			Errors,
		},
		computed: {
			errors () {
				return this.$store.state.errors;
			},
		},
	};
</script>

<style>
	.main {
		background: #fff;
		border-radius: 2px;
		box-shadow: 0 0 35px rgba(0, 0, 0, .4);
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}
	.main__head {
		flex: 0 0 auto;
	}
	.main__content {
		flex: 1 1 0;
		min-height: 0;
	}
</style>
