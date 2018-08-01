<template v-if="value">
	<span v-html="this.value"></span>
</template>

<script>
	import i18n from '../i18n.js';
	export default {
		data() {
			return {
				value: false
			}
		},
		props: {
			tag: String,
			substitutions: Array,
		},
		methods: {
			resolve() {
				i18n(this.tag, this.substitutions)
					.then(result => this.value = result || this.tag);	
			},
		},
		created() {
			this.resolve();
		},
		watch: {
			tag: 'resolve',
			substitutions: 'resolve'
		},
	};
</script>
