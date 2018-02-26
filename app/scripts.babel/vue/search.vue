<template>
	<Results v-if="itemsOrder.length" />
	<NoResults v-else />
</template>

<script>
	import Results from './results.vue';
	import NoResults from './no-results.vue';
	import { mapState } from 'vuex';
	export default {
		computed: mapState(['itemsOrder']),
		components: {
			Results,
			NoResults,
		},
	};
</script>

<style>
</style>