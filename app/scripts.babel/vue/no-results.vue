<template>
	<div class="no-results">
		<img class="no-results__image" src="/images/no-results.svg" alt="" width="181">
		<p class="no-results__text">
			<trans-late tag="noResults" :substitutions="[`<em class='no-results__query'>“${ $route.params.query }”</em>`]" />
		</p>
		<button @click="close()" class="no-results__close"><trans-late tag="close"/></button>
	</div>
</template>

<script>
	export default {
		methods: {
			close () {
				this._sendActionToCurrentTab('closeIframe');
			},
		},
	};
</script>

<style>
	.no-results {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #f7f9fc;
		padding: 1em 2em;
	}
	.no-results__text {
		margin: 1em 0 0;
		flex: 0 0 auto;
		font-size: 1.5em;
		text-align: center;
	}
	.no-results__query {
		display: block;
		margin: 0;
		flex: 0 1 auto;
		overflow: hidden;
		font-size: 1rem;
		color: #999b9e;
		line-height: 1.35;
		height: 2.7em;
		text-overflow: ellipsis;
		padding: 0 .2em;
	}
	.no-results__image {
		flex-shrink: 0;
	}
	.no-results__close {
		border: none;
		background: #000;
		flex-shrink: 0;
		text-transform: uppercase;
		color: #fff;
		padding: 8px 20px;
		margin: 35px 0 0;
		border-radius: 1px;
	}
</style>
