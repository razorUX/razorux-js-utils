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
	
	clone,
	invokeMethod
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
