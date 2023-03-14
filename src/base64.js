function base64ToString(base64text) {
	return Buffer.from(base64text, 'base64').toString("ascii");
}

function stringToBase64(str) {
	return Buffer.from(str).toString('base64');
}

exports.base64ToString = base64ToString;
exports.stringToBase64 = stringToBase64;