<template>
	<div class="results">
		<div class="results__summary">
			<div class="results__term">
				Search results for <strong class="results__query">{{$route.params.query}}</strong>
			</div>
			<div class="results__number">{{itemsOrder.length}}</div>
		</div>
		<ul class="results__grid">
			<Result v-for="item in itemsOrder" :item="items[item]" :key="item.id" />
		</ul>
	</div>
</template>

<script>
	import Result from './result.vue';
	import { mapState } from 'vuex';
	export default {
		computed: mapState(['items', 'selectedItem', 'itemsOrder', 'query']),
		components: {
			Result,
		},
	};
</script>

<style>
	.results {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}

	.results_empty {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 1.2em;
		height: 100%;
		padding: 1em;
	}

	.results__grid {
		flex: 1 1 0;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-auto-rows: 146px;
		grid-gap: 1px;
		margin: 0;
		padding: 0;
		list-style: none;
		overflow: auto;
	}

	.results__item {
		cursor: pointer;
	}

	.results__summary {
		display: flex;
		height: 40px;
		align-items: center;
		padding: 5px 15px;
		flex: 0 0 auto;
	}

	.results__term {
		color: #9f9f9f;
	}

	.results__query {
		color: #424242;
	}

	.results__number {
		margin-left: auto;
	}
</style>