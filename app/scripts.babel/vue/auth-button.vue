<template>
	<button :disabled="isDisabled" @click="toggleAuthorize">
		<span v-if="isAuthorized">Unlink Trakt account</span>
		<span v-else>Link Trakt account</span>
	</button>
</template>

<script>
	export default {
		methods: {
			toggleAuthorize() {
				this.$store.dispatch(
					this.$store.getters.isAuthorized ? 'unauthorize' : 'authorize'
				);
			},
		},
		computed: {
			isDisabled() {
				return this.$store.state.traktAuth.isBusy;
			},
			isAuthorized() {
				return this.$store.getters.isAuthorized;
			},
		},
	};
</script>
