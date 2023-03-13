function createErrorType(name, suppressErrorNotification) {
	const errorFn =  function ({message, error}) {
		this.name = name;
		this.message = message;
		this.deliberate = true;
		this.suppressErrorNotification = suppressErrorNotification || false;
		this.exposeErrorMessageToClient = true;
		this.internalError = error;
	}
	errorFn.prototype = Error.prototype;
	return errorFn;
}

exports.createErrorType = createErrorType;