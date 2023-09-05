function assertDefined(value, name, errorClass) {
	assert({ 
		value,
		name,
		toBe: 'defined',
		passed: isUndefined(value),
		errorClass
	})
}

function assertTruthy(value, name, errorClass) {
	assert({ 
		value,
		name,
		toBe: 'truthy',
		passed: !!value,
		errorClass
	})
}

function assertTypeString(value, name, errorClass) {
	assert({ 
		value,
		name,
		toBe: 'a String',
		passed: isTypeof(value, 'string'),
		errorClass
	})
}

function assertTypeNumber(value, name, errorClass) {
	assert({ 
		value,
		name,
		toBe: 'a number',
		passed: !isNaN(parseFloat(value)) && isFinite(value),
		errorClass
	})
}

function assertTypeObject(value, name, errorClass) {
	assert({ 
		value,
		name,
		toBe: 'an Object',
		passed: isObject(value),
		errorClass
	})
}

function assertTypeArray(value, name, errorClass) {
	assert({ 
		value,
		name,
		toBe: 'an Object',
		passed: isTypeof(value, 'object') && isArray(value),
		errorClass
	})
}

function assert({ name, value, toBe: expectedType, passed: passed, errorClass }) {
	if(!expectedType) throw new TypeError('expectedType is required.')
	if(passed === undefined) throw new TypeError('passed is required.')
	
	if(!name) name = "Argument"
	
	// console.log('Assert:');
	// console.log({ name, value, 'typeofValue': typeof value, toBe: expectedType, passed: passed });
	
	if(!passed) throw new (errorClass || TypeError)(`Expected ${name} to be ${expectedType}. (Got: ${value}. typeof: ${typeof value})`);
}


// Type helpers

function isTypeof(value, typeString) {
	return typeof value === typeString;
}

function isObject(value) {
	return isTypeof(value, 'object') && !isArray(value) && !isNull(value)
}

function isArray(value) {
	return Array.isArray(value);
} 

function isNull(value) {
	return value === null
}

function isUndefined(value) {
	return value !== undefined;
}

// Exports

exports.assertDefined = assertDefined;
exports.assertTruthy = assertTruthy;

exports.assertTypeString = assertTypeString;
exports.assertTypeNumber = assertTypeNumber;
exports.assertTypeObject = assertTypeObject;
exports.assertTypeArray = assertTypeArray;

exports.assert = assert;

exports.isTypeof = isTypeof;
exports.isObject = isObject;
exports.isArray = isArray;
exports.isNull = isNull;
exports.isUndefined = isUndefined;