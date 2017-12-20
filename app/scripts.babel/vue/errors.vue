<template>
	<ul class="errors" v-else-if="messages.length">
		<li class="errors__item"
		    v-for="message in messages">
			{{ message }}
		</li>
	</ul>
</template>

<script>
	export default {
		props: ['messages'],
	};
</script>

<style>
</style>