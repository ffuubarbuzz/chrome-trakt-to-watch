<template>
	<main class="main">
		<HeadBar class="main__head" />
		<div class="main__content">
			<Errors v-if="errors.length" :messages="errors" />
			<Results v-else :items="items" :query="query" />
		</div>
	</main>
</template>

<script>
	import HeadBar from './head.vue';
	import Errors from './errors.vue';
	import Results from './results.vue';
	export default {
		props: ['items', 'query', 'errors'],
		components: {
			HeadBar,
			Errors,
			Results,
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
		max-height: 100%;
	}
</style>
