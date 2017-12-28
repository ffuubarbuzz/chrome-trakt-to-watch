<template>
	<button :disabled="isDisabled" @click="toggleAuthorize">
		<template v-if="isAuthorized">Unlink Trakt account</template>
		<template v-else>Link Trakt account</template>
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
