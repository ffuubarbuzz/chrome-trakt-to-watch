<template>
	<div class="detailed "
	     :class="[item.poster_path ? '' : 'detailed_no-poster']"
	>
		<button class="detailed__back"
		        @click="$router.back()">🔙</button>
		<img class="detailed__image"
		     width="171"
		     :alt="nameOrTitle"
		     :srcset="`https://image.tmdb.org/t/p/w342${item.poster_path} 1x, https://image.tmdb.org/t/p/w342${item.poster_path} 2x`"
		     v-if="item.poster_path"
		>
		<div class="detailed__overlay">
			<div class="detailed__title">{{nameOrTitle}}</div>
			<div class="detailed__meta"><trans-late :tag="this.type" />, {{date | formatDate('YYYY') }}</div>
			<div class="detailed__overview">{{item.overview}}</div>
			<button class="detailed__action" @click="addToWatchlist(item)"><trans-late tag="addToTraktWatchlist" /></button>
		</div>
	</div>
</template>

<script>
	import { mapState, mapActions } from 'vuex';
	export default {
		methods: {
			...mapActions([
				'addToWatchlist'
			]),
		},
		computed: {
			nameOrTitle () {
				return this.item.name || this.item.title;
			},
			date () {
				return this.item.release_date || this.item.first_air_date;
			},
			item () {
				return this.$store.state.items[this.$route.params.id];
			},
			type () {
				return `mediaType_${this.item.media_type}`;
			}
		},
	};
</script>

<style>
	.detailed {
		position: relative;
		height: 100%;
	}

	.detailed_type_movie::before,
	.detailed_type_tv::before {
		position: absolute;
		top: 3px;
		right: 3px;
	}

	.detailed__back {
		position: absolute;
		top: 0;
		left: 0;
	}

	.detailed__image {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.detailed__title {
		margin: 0;
		font-weight: bold;
	}

	.detailed__meta {
		margin: 0;
		font-size: .8em;
		color: #E0F2F1;
	}

	.detailed__overview {
		flex-shrink: 1;
		min-height: 0;
		margin: 1em 0;
		overflow: auto;
	}

	.detailed__action {
		border: none;
		background: #ed1d24;
		padding: 5px;
		border-radius: 2px;
		margin-top: auto;
		flex-shrink: 0;
	}

	.detailed__overlay {
		position: absolute;
		display: flex;
		flex-direction: column;
		color: #fff;
		right: 0;
		bottom: 0;
		left: 0;
		max-height: 80%;
		padding: .2em 1em 1em;
		background: rgba(0, 0, 0, .4);
	}

</style>