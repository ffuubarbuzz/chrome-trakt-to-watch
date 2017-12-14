<template>
	<ul class="results" v-if="!!items.length">
		<li class="results__item result"
		    v-for="item in items"
		    v-on:click="select(item)"
		>
			<img class="result__image"
			     v-if="item.poster_path"
			     v-bind:alt="item.title"
			     v-bind:title="item.title"
			     v-bind:src="`https://image.tmdb.org/t/p/w92${item.poster_path}`"
			>
			<div class="result__no-image"
			     v-else
			     v-bind:title="item.title"
			>
				<div>
					<p class="result__title">{{item.title}}</p>
					<p class="result__year">{{item.release_date | formatDate('YYYY') }}</p>
				</div>
			 </div>
		</li>
	</ul>
	<p class="results results_empty" v-else>No results found for "{{ queryStr }}"</p>
</template>

<script>
	export default {
		props: ['items', 'queryStr'],
		methods: {
			select: item => {
				chrome.runtime.sendMessage({
					action: 'select',
					payload: item.id
				});
			},
		}
	};
</script>