<template>
	<ul class="results">
		<li class="results__item result"
		    v-for="item in items"
		    v-on:click="select(item)"
		>
			<img class="result__image"
			     v-bind:alt="item.title"
			     v-bind:src="`https://image.tmdb.org/t/p/w92${item.poster_path}`"
			>
		</li>
	</ul>
</template>

<script>
	export default {
		props: ['items'],
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