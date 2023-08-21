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
	
	createErrorType,
	
	enableConsoleLogging,
	disableConsoleLogging,
	
	retry,
	
	clamp,
	isNumber,
	getRandomIntBetween,
	createRandomNumberGenerator,
	
	base64ToString,
	stringToBase64,
	
	randomNumberBetween
} = require('../src/main')


describe('Number helpers', () => {
	describe('clamp', () => {
		test('Should throw if not given a number', () => {
			let error;
			try {
				clamp("blah")
			} catch(e) {
				error = e;
			}
			expect(error.name).toBe('TypeError');
			expect(error.message).toBe('Invalid argument. Must be called with a valid number. (Got: blah).');
		});
		
		test('Should return same num if no min or max supplied', () => {
			const expected = 42;
			const actual = clamp(42)
			expect(actual).toBe(expected);
		});
		
		test('Should return the same if it\'s between min and max', () => {
			const expected = 42;
			const actual = clamp(42, {min: 41, max: 43})
			expect(actual).toBe(expected);
		});
		
		test('Should return min if num is less than min', () => {
			const expected = 50;
			const actual = clamp(42, { min: 50})
			expect(actual).toBe(expected);
		});
		
		test('Should return max if num is more than max', () => {
			const expected = 42;
			const actual = clamp(50, { max: 42})
			expect(actual).toBe(expected);
		});
	});
	
	describe('isNumber', () => {
	
		test('Should be true for integers', async () => {
			expect(isNumber(1)).toBe(true);
		});
		
		test('Should be true for negative integers', async () => {
			expect(isNumber(-1)).toBe(true);
		});
		
		test('Should be false for undefined', async () => {
			expect( isNumber(undefined) ).toBe(false);
		});
		
		test('Should be false for strings', async () => {
			expect(isNumber('blah!')).toBe(false);
		});
		
		test('Should be false for strings with numbers', async () => {
			expect(isNumber('1')).toBe(false);
		});
		
		test('Should be false for objects', async () => {
			expect(isNumber({})).toBe(false);
		});
		
		test('Should be false for arrays', async () => {
			expect(isNumber([])).toBe(false);
		});
		
		test('Should be false for booleans', async () => {
			expect(isNumber(true)).toBe(false);
		});
		
	});

});

describe('createRandomNumberGenerator', () => {

	test('should generate deterministic pseudorandom numbers', async () => {
		const seed = 'PRESIDENT WOODROW WILSON';
		const getRandomNumber = createRandomNumberGenerator(seed);
		
		expect(getRandomNumber()).toBe(0.26642920868471265);
		expect(getRandomNumber()).toBe(0.0003297457005828619);
		expect(getRandomNumber()).toBe(0.2232720274478197);
	});
	
});

describe('getRandomIntBetween', () => {

	test('gives random integers', async () => {
		const min = 0;
		const max = 10000;
		
		jest.useFakeTimers({ now: 1678710204307});
		expect(getRandomIntBetween(min, max)).toBe(7039);
		
		jest.useFakeTimers({ now: 1678710301307});
		expect(getRandomIntBetween(min, max)).toBe(695);
		
		jest.useFakeTimers({ now: 1678710304307});
		expect(getRandomIntBetween(min, max)).toBe(5287);
		
		jest.useRealTimers();
	});
	
});

describe('base64', () => {
	
	describe('base64ToString', () => {
	
		test('should decode base64 strings', async () => {
			const input = "SnVzdCB5b3Ugd2FpdCwgSGVucnkgSGlnZ2lucywganVzdCB5b3Ugd2FpdC4uLg==";
			const expected = "Just you wait, Henry Higgins, just you wait..."
			const actual = base64ToString(input);
			
			expect(actual).toBe(expected);
		});
		
		test('should encode base64 strings', async () => {
			const input = "Just you wait, Henry Higgins, just you wait...";
			const expected = "SnVzdCB5b3Ugd2FpdCwgSGVucnkgSGlnZ2lucywganVzdCB5b3Ugd2FpdC4uLg==";
			const actual = stringToBase64(input);
			
			expect(actual).toBe(expected);
		});
		
	});
});


describe('loadEnvVars', () => {
	test('Should run with no errors', () => {
		expect(() =>{
			validateEnvVars([
				"NODE_ENV"
			]);
		}).not.toThrow();
	});
})

describe('random', () => {

	test('randomNumberBetween', async () => {
		const min = 2;
		const max = 4096;
		const expected = randomNumberBetween(min, max)
		expect(expected).toBeGreaterThan(min);
		expect(expected).toBeLessThan(max);
	});
	
});
