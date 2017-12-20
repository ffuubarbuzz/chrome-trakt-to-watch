<template>
	<p class="results results_empty" v-if="!items.length">No results found for "{{ query }}"</p>
	<div class="results" v-else>
		<div class="results__summary">
			<div class="results__term">
				Search results for <strong class="results__query">{{query}}</strong>
			</div>
			<div class="results__number">{{items.length}}</div>
		</div>
		<ul class="results__grid">
			<li class="results__item result"
			    :class="`result_type_${item.media_type}`"
			    v-for="item in items"
			    @click="select(item)"
			>
				<img class="result__image"
				     :alt="item.name"
				     :title="item.name"
				     :srcset="`https://image.tmdb.org/t/p/w92${item.poster_path} 1x, https://image.tmdb.org/t/p/w185${item.poster_path} 2x`"
				     v-if="item.poster_path"
				>
				<div class="result__no-image"
				     :title="item.name"
				     v-else
				>
					<div>
						<p class="result__title">{{item.name}}</p>
						<p class="result__year">{{item.release_date | formatDate('YYYY') }}</p>
					</div>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
	export default {
		props: ['items', 'query'],
		methods: {
			select (item) {
				chrome.runtime.sendMessage({
					type: 'addToWatchlist',
					payload: item.id
				});
			},
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

	.result {
		position: relative;
	}

	.result_type_movie::before,
	.result_type_tv::before {
		position: absolute;
		top: 3px;
		right: 3px;
	}

	.result_type_movie::before {
		content: '🍿';
	}

	.result_type_tv::before {
		content: '🎥';
	}

	.result__image {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.result__no-image {
		width: calc(100% - 2px);
		height: calc(100% - 2px);
		margin: 1px;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		text-overflow: ellipsis;
		border: 1px solid #fff;
		padding: 1em;
		text-align: center;
	}
	.result__year {
		font-size: .8em;
		color: #E0F2F1;
	}
</style>