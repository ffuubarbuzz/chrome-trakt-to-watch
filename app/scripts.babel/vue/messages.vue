<template>
	<ul class="messages">
		<li v-for="(message, index) in messages" class="messages__item message">
			<div class="message__text">{{message}}</div>
			<div @click="closeMessage(index)" class="message__close">✕</div>
		</li>
	</ul>
</template>

<script>
	export default {
		methods: {
			closeMessage (index) {
				this.$store.commit('removeMessage', index);
			},
		},
		computed: {
			messages () {
				return this.$store.state.messages;
			},
		},
	};
</script>

<style>
	.messages {
		padding: 0;
		list-style: none;
	}
	.message {
		background-color: #f9edbe;
		border-color: #f0c36d;
		box-shadow: 0px 2px 4px rgba(0,0,0,0.2);
		border-radius: 2px;
		display: flex;
		align-items: center;
		border-radius: 3px;
		padding: .5em  0 .5em 1em;
	}
	.message__text {
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.message__close {
		margin-left: auto;
		align-self: flex-start;
		font-size: 12px;
		height: 24px;
		line-height: 24px;
		width: 24px;
	}
	.message__close:hover,
	.message__close:active {
		background: none;
	}
</style>
