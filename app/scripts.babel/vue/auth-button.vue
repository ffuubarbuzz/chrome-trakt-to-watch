<template>
	<button :disabled="isDisabled" @click="toggleAuthorize">
		<template v-if="isAuthorized"><trans-late tag="unlinkTraktAccount" /></template>
		<template v-else><trans-late tag="linkTraktAccount" /></template>
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
