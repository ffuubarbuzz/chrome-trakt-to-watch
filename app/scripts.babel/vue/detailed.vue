<template>
	<div class="detailed "
	     :class="[`detailed_type_${item.media_type}`, item.poster_path ? '' : 'detailed_no-poster']"
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
			<div class="detailed__year">{{date | formatDate('YYYY') }}</div>
			<div class="detailed__overview">{{item.overview}}</div>
			<button class="detailed__action" @click="addToWatchlist()">👁+</button>
		</div>
	</div>
</template>

<script>
	import { mapState } from 'vuex';
	export default {
		methods: {
			addToWatchlist () {
				// todo: move to separate component
				chrome.runtime.sendMessage({
					target: 'background',
					type: 'addToWatchlist',
					payload: {
						id: this.item.id,
						type: this.item.media_type,
					},
				}, response => {
					if (response.status === 'fail') {
						this.$store.commit('addError', response.message);
					}
				});
			},
			back () {
				this.$router.back();
			}
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
			}
		}
	};
</script>

<style>
	.detailed {
		position: relative;
		overflow: auto;
		height: 100%;
	}

	.detailed_type_movie::before,
	.detailed_type_tv::before {
		position: absolute;
		top: 3px;
		right: 3px;
	}

	.detailed_type_movie::before {
		content: '🍿';
	}

	.detailed_type_tv::before {
		content: '🎥';
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
	.detailed__year {
		margin: 0;
		font-size: .8em;
		color: #E0F2F1;
	}
	.detailed__action {
		border: none;
		background: #ed1d24;
		padding: 5px;
		border-radius: 2px;
		margin-top: auto;
	}
	.detailed__overlay {
		position: absolute;
		color: #fff;
		right: 0;
		bottom: 0;
		left: 0;
		padding: .2em 1em;
		background: rgba(0, 0, 0, .4);
	}
</style>