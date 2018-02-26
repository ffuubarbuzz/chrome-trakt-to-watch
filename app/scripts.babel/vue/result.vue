<template>
	<li class="results__item result"
		:class="{
			[`result_type_${item.media_type}`]: item.media_type,
			'result_no-poster': !item.poster_path,
			'result_loading': item.isLoading,
		}"
	>
		<router-link :to="`/item/${item.id}`">
			<img class="result__image"
				width="171"
				:alt="nameOrTitle"
				:srcset="`https://image.tmdb.org/t/p/w342${item.poster_path} 1x,
				          https://image.tmdb.org/t/p/w342${item.poster_path} 2x`"
				v-if="item.poster_path"
			>
			<div class="result__overlay">
				<p class="result__title">{{nameOrTitle}}</p>
				<p class="result__year">{{date | formatDate('YYYY') }}</p>
				<router-link :to="'/search/bar'" class="result__action" @click.stop="addToWatchlist()">👁+</router-link>
			</div>
		</router-link>
	</li>
</template>

<script>
	export default {
		props: ['item'],
		methods: {
			addToWatchlist () {
				this.$store.commit('setItemLoading', this.item.id);
				chrome.runtime.sendMessage({
					target: 'background',
					type: 'addToWatchlist',
					payload: {
						id: this.item.id,
						type: this.item.media_type,
					},
				}, response => {
					this.$store.commit('setItemNotLoading', this.item.id);
					if (response.status === 'fail') {
						this.$store.commit('addError', response.message);
					}
				});
			}
		},
		computed: {
			nameOrTitle () {
				return this.item.name || this.item.title;
			},
			date () {
				return this.item.release_date || this.item.first_air_date;
			}
		}
	};
</script>

<style>
	.result {
		position: relative;
		overflow: hidden;
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
	.result__overlay {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		padding: 1em;
		color: #fff;
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background: rgba(0, 0, 0, .3);
		opacity: 0;
		transform: scale(1.2);
		transition: all .2s ease-in-out;
		visibility: hidden;
		z-index: 1;
	}
	.result:hover .result__overlay,
	.result_no-poster .result__overlay {
		opacity: 1;
		transform: none;
		visibility: visible;
	}
	.result__title {
		margin: 0;
		font-weight: bold;
		min-height: 0;
		overflow: hidden;
	}
	.result__year {
		margin: 0;
		font-size: .8em;
		color: #E0F2F1;
	}
	.result__action {
		border: none;
		background: #ed1d24;
		padding: 5px;
		border-radius: 2px;
		margin-top: auto;
	}
</style>