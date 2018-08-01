export default function(tag, substitutions) {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({
			target: 'background',
			type: 'getTranslation',
			payload: {
				tag,
				substitutions
			},
		}, resolve);
	});
};
