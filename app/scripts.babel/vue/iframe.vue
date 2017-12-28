<template>
	<main class="main">
		<HeadBar class="main__head" />
		<Errors />
		<div class="main__content">
			<Detailed v-if="selectedItem" :item="items[selectedItem]" />
			<Results v-else-if="itemsOrder.length" />
			<NoResults v-else-if="query" />
			<div v-else class="main__loading">
				<img src="/images/throbber_medium.svg" width="28" height="28" alt="">
			</div>
		</div>
	</main>
</template>

<script>
	import HeadBar from './head.vue';
	import Errors from './errors.vue';
	import Results from './results.vue';
	import Detailed from './detailed.vue';
	import NoResults from './no-results.vue';
	import { mapState } from 'vuex';
	export default {
		computed: mapState(['items', 'itemsOrder', 'selectedItem', 'query', 'errors']),
		components: {
			HeadBar,
			Errors,
			Results,
			Detailed,
			NoResults,
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
	.main__loading {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
	}
</style>
