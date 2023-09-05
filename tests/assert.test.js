const {
	assertDefined,
	assertTruthy,
	
	assertTypeString,
	assertTypeNumber,
	assertTypeObject,
	assertTypeArray,
} = require('../src/assert');


function captureException(fn) {
	try {
		fn()
	} catch(e) {
		return e;
	}
}

describe('Asserts', () => {
	
	describe('assertDefined', () => {
	
		test('matches undefined', async () => {
			const error = captureException(_ => {
				assertDefined(undefined)
			});
			
			expect(error.message).toBe("Expected Argument to be defined. (Got: undefined. typeof: undefined)");
		});
		
		test("does'nt throw on numbers", async () => {
			const error = captureException(_ => {
				assertDefined(42)
			});
			
			expect(error).toBeUndefined();
		});
		
		test("does'nt throw on falsy values", async () => {
			const error = captureException(_ => {
				assertDefined(-1);
				assertDefined(0);
				assertDefined("");
				assertDefined([]);
				assertDefined({});
			});
			
			expect(error).toBeUndefined();
		});
		
	});
	
	describe('assertTruthy', () => {
	
		test("does't throw on truthy values", async () => {
			const truthyValues = [
				true,
				{},
				[],
				42,
				"0",
				"false",
				new Date(),
				-42,
				12n,
				3.14,
				-3.14,
				Infinity,
				-Infinity
			]
			
			const error = captureException(_ => {
				truthyValues.forEach(v => assertTruthy(v))
			});
			
			expect(error).toBeUndefined();
		});
		
	});
	
	describe('assertTypeString', () => {
	
		test("does't throw on String values", async () => {
			const truthyValues = [
				"",
				"Hello!",
			]
			
			const error = captureException(_ => {
				truthyValues.forEach(v => assertTypeString(v))
			});
			
			expect(error).toBeUndefined();
		});
		
		test("throws on non-String values", async () => {
			const testValues = [
				{ value: 42, errorMessage: "Expected Argument to be a String. (Got: 42. typeof: number)" },
				{ value: [], errorMessage: "Expected Argument to be a String. (Got: . typeof: object)" },
				{ value: new String(), errorMessage: "Expected Argument to be a String. (Got: . typeof: object)" },
			]
			
			
				testValues.forEach(({ value, errorMessage }) => {
					const error = captureException(_ => assertTypeString(value));
					
					expect(error.message).toBe(errorMessage);
				});

		});
		
	});

});
