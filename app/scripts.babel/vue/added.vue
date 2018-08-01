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
		<!-- todo: undo button -->
		<!-- todo: link to watchlist -->
		<button @click="close()" class="added__close"><trans-late tag="close"/></button>
	</div>
</template>

<script>
	import { mapState } from 'vuex';
	export default {
		methods: {
			close () {
				this._sendActionToCurrentTab('closeIframe');
			},
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
	.added {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.added__back {
		position: absolute;
		top: 0;
		left: 0;
	}
</style>