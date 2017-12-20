<template>
	<header class="head">
		<strong class="head__name name">
			trakt.<span class="name__secondary">extension</span>
		</strong>
		<div class="head__controls">
			<button class="head__control" @click="openOptions">⚙</button>
		</div>
	</header>
</template>

<script>
	export default {
		methods: {
			openOptions () {
				chrome.runtime.openOptionsPage();
			},
		},
	};	
</script>

<style>
	.head {
		height: 45px;
		background: #242424;
		color: #fff;
		display: flex;
		align-items: center;
		padding: 5px 15px;
	}

	.head__name {
		font-size: 1.2em;
		font-weight: 500;
	}

	.head__controls {
		margin-left: auto;
	}

	.head__control {
		margin: 0;
		padding: 0;
		border: none;
		background: none;
	}

	.name__secondary {
		color: #a7a7a7;
	}
</style>
