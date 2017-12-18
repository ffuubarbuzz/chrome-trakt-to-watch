<template>
	<ul class="results" v-if="!!items.length && !errors.length">
		<li class="results__item result"
		    :class="`result_type_${item.media_type}`"
		    v-for="item in items"
		    @click="select(item)"
		>
			<img class="result__image"
			     :alt="item.name"
			     :title="item.name"
			     :src="`https://image.tmdb.org/t/p/w92${item.poster_path}`"
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
	<ul class="errors" v-else-if="errors.length">
		<li class="errors__item"
		    v-for="error in errors">
			{{ error }}
		</li>
	</ul>
	<p class="results results_empty" v-else>No results found for "{{ query }}"</p>
</template>

<script>
	export default {
		props: ['items', 'query', 'errors'],
		methods: {
			select: item => {
				chrome.runtime.sendMessage({
					type: 'addToWatchlist',
					payload: item.id
				});
			},
		}
	};
</script>
