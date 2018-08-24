export default class TranslatedError extends Error {
	constructor(tag, substitutions) {
		super(tag);
		this.name = 'TranslatedError';
		this.substitutions = substitutions;
	}
}
