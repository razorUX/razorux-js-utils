const {
	
	loadEnvVars,
	validateEnvVars,
	
	readCsvFile,
	writeCsvFile,
	
	readTextFile,
	
	ensureDirExists,
	
	readJsonFile,
	writeJsonFile,
	
	normalizeToken,
	
	dollarsToCents,
	centsToDollars,
	
	invokeMethod,
	
	
	pipe,
	map,
	
	clone,
	
	asyncMap,
	asyncForEach,
	
	sendSlackNotification,
	getCloudWatchLogDeeplink,
	sendErrorNotification,
	
	simpleHash,
	
	sleep,
	
	parseBoolean,
	
	retryable,
	
	validateJson,
	
	createErrorType
} = require('../src/main')


describe('loadEnvVars', () => {
	test('Should run with no errors', () => {
		expect(() =>{
			validateEnvVars([
				"NODE_ENV"
			]);
		}).not.toThrow();
	});
})
