<template>
	<div class="options">
		<Messages v-if="messages.length" class="options__messages" />
		<AuthButton />
	</div>
</template>

<script>
	import AuthButton from './auth-button.vue';
	import Messages from './messages.vue';
	export default {
		components: {
			AuthButton,
			Messages,
		},
		computed: {
			messages () {
				return this.$store.state.messages;
			}
		},
	};
</script>

<style>
	.options__messages {
		margin: 0 0 1em;
	}
</style>
