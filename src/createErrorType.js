function createErrorType(name, suppressErrorNotification) {
	const errorFn =  function (args) {
		this.name = name;
		this.message = args?.message || name;
		this.deliberate = true;
		this.suppressErrorNotification = suppressErrorNotification || false;
		this.exposeErrorMessageToClient = true;
		this.internalError = args?.error;
		this.metadata = args?.metadata;
	}
	errorFn.prototype = Error.prototype;
	return errorFn;
}

exports.createErrorType = createErrorType;