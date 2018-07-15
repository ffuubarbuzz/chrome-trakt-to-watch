<template>
	<div class="added"
	     :class="[`added_type_${item.media_type}`, item.poster_path ? '' : 'added_no-poster']"
	>
		<button class="added__back"
		        @click="$router.back()">🔙</button>
		<img class="added__image"
		     width="171"
		     :alt="nameOrTitle"
		     :srcset="`https://image.tmdb.org/t/p/w342${item.poster_path} 1x, https://image.tmdb.org/t/p/w342${item.poster_path} 2x`"
		     v-if="item.poster_path"
		>
		added!
		undo?
	</div>
</template>

<script>
	import { mapState } from 'vuex';
	export default {
		methods: {
		},
		computed: {
			nameOrTitle () {
				return this.item.name || this.item.title;
			},
			date () {
				return this.item.release_date || this.item.first_air_date;
			},
			item() {
				return this.$store.state.items[this.$route.params.id];
			},
		}
	};
</script>

<style>
	.added {}
</style>