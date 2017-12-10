<template>
	<ul>
		<li v-for="item in items" v-bind:data-id="item.id" v-on:click="select(item)">
			{{item.title}}
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