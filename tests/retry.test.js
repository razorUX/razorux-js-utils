const {	
	retry,
	enableConsoleLogging,
	disableConsoleLogging,
} = require('../src/main')


// disableConsoleLogging()

describe('retry', () => {
	test('should only run once if no args', async () => {
		const expectedRunCount = 1;
		
		let actualRunCount = 0
		const fn = () => actualRunCount += 1;
		
		await retry(fn);
		
		expect( actualRunCount ).toBe( expectedRunCount );
	});
	
	test('should retry if an error occurs', async () => {
		const expectedRunCount = 2;
		
		let actualRunCount = 0
		const fn = () => {
			actualRunCount += 1 
			if(actualRunCount == 1) throw new Error();
		};
		
		await retry(fn);
		
		expect( actualRunCount ).toBe( expectedRunCount );
	});  	
	
	describe('max retry limit', () => {
	
		test('should not throw if under the retry limit', async () => {
			const retryLimit = 3;
			
			let actualRunCount = 0
			const fn = () => {
				actualRunCount += 1 
				if(actualRunCount <= 2) throw new Error();
			};
			
			let error;
			try {
				await retry(fn, { maxRetryCount: retryLimit });	
			} catch(e) {
				error = e;
			}
			
			expect( error ).toBe(undefined);
		});
		
		test('should throw if the retry limit has been depleted', async () => {
			const retryLimit = 3;
			
			let actualRunCount = 0;
			const fn = () => {
				actualRunCount += 1 
				throw new Error();
			};
			
			let error;
			try {
				await retry(fn, {  maxRetryCount: retryLimit });	
			} catch(e) {
				error = e;
			}
		  expect(actualRunCount).toBe(retryLimit);
			expect( error.name ).toBe("RetryLimitReachedError");
		});
		
	});
	
	describe('Retry delay', () => {
		beforeAll(() => {
			jest.useFakeTimers();
		});
		
		afterAll(() => {
			jest.useRealTimers();
		})
		
		describe('linear delay', () => {
			test('should wait n milliseconds before retrying', async () => {
				let actualRunCount = 0;
				
				const fn = () => {
					actualRunCount += 1 
					if(actualRunCount <= 1) throw new Error('Testing retry');
				};
							
				const promise = retry(fn, {
					retryDelayMs: 1000
				});
				
				console.log('Running timers #1')
				await Promise.resolve();
				jest.advanceTimersByTime(999); // Advance time 999 milliseconds
				await Promise.resolve();
				
				expect(actualRunCount).toBe(1);
				
				console.log('Running timers #2')
				jest.advanceTimersByTime(1); // Add 1ms to the clock
				await Promise.resolve();
				await Promise.resolve();
				
				expect(actualRunCount).toBe(2);
				
				await promise;
			});
			
			
			
		});

	});
	
	describe('jitter', () => {
		beforeAll(() => {
			jest.useFakeTimers();
		});
		
		afterAll(() => {
			jest.useRealTimers();
		})
		
		test('should add a small random delay', async () => {
			let actualRunCount = 0;
			
			const fn = () => {
				actualRunCount += 1 
				if(actualRunCount <= 3) throw new Error('Testing retry');
			};
						
			const promise = retry(fn, {
				retryDelayMs: 1,
				
				jitter: true,
				minJitterMs: 0,
				maxJitterMs: 50,
				jitterRandomSeed: "TOAD STROGANOFF" // This seed generated the following sequence: 24, 17, 15
			});
			
			await advanceTimeMs(24); // 24ms elapsed
			expect(actualRunCount).toBe(1);
			
			await advanceTimeMs(1); // 25ms elapsed
			expect(actualRunCount).toBe(2);
			
			await advanceTimeMs(17); // 15ms elapsed
			expect(actualRunCount).toBe(2);
			
			await advanceTimeMs(15); // 15ms elapsed
			expect(actualRunCount).toBe(3);
			
			await advanceTimeMs(32);
			
			await promise;
		});
		
	});


	describe('Master retry timeout', () => {
		test('Should throw if the retry timeout has been exceeded', async () => {
			let actualRunCount = 0;
			
			const fn = () => {
				actualRunCount += 1 
				throw new Error('Testing retry');
			};
	
			let error;
			try {
				let promise = await retry(fn, {
					retryDelayMs: 50,
					timeout: 100,
					maxRetryCount: 5
				});
			} catch(e) {
				error = e;
			}
			expect( error.name ).toBe("RetryTimeoutError");
			expect( error.message ).toMatch("Retry timeout of 100ms exceeded (Total elapsed time:");
		});
		
	});
	
	async function advanceTimeMs(ms) {
		await Promise.resolve();
		jest.advanceTimersByTime(ms);
		await Promise.resolve();
	}
	
	describe('Exponential backoff', () => {
		
		beforeAll(() => {
			jest.useFakeTimers();
		});
		
		afterAll(() => {
			jest.useRealTimers();
		})
		
		test('should wait exponentially more before trying again', async () => {
			let actualRunCount = 0;
			
			const fn = () => {
				actualRunCount += 1 
				if(actualRunCount <= 4) throw new Error('Testing retry');
			};
						
			const promise = retry(fn, {
				retryDelayMs: 1,
				maxRetryCount: 10,
				backoff: true
			});
					
			console.log('Running timers #1')
			expect(actualRunCount).toBe(1);
			
			await advanceTimeMs(1); // 1ms
				
			await advanceTimeMs(1); // 2ms
			await advanceTimeMs(1); // 3ms
			expect(actualRunCount).toBe(2);
			
			await advanceTimeMs(1); // 4ms
			await advanceTimeMs(3); // 7ms
			expect(actualRunCount).toBe(3);
			

			await advanceTimeMs(1); // 8ms
			await advanceTimeMs(4); // 12ms
			await advanceTimeMs(3); // 15ms
			expect(actualRunCount).toBe(4);
			
			await advanceTimeMs(1); // 16ms
			await advanceTimeMs(17); // 33ms 
			expect(actualRunCount).toBe(5);
			
			await promise;
		});
		
		test('min retry delay', async () => {
			let actualRunCount = 0;
			
			const fn = () => {
				actualRunCount += 1 
				if(actualRunCount <= 1) throw new Error('Testing retry');
			};
						
			const promise = retry(fn, {
				retryDelayMs: 1,
				minRetryDelay: 32,
				maxRetryCount: 10,
			});
						
			await advanceTimeMs(1); // 1ms elapsed - Wait should artificially limited to 32ms
			await advanceTimeMs(15); // 16ms elapsed
			await advanceTimeMs(15); // 31ms elapsed
			expect(actualRunCount).toBe(1);
		
			await advanceTimeMs(1); // 32ms elapsed
			expect(actualRunCount).toBe(2);
			
			await promise;
		});
		
		test('max retry delay (truncated exponential backoff)', async () => {
			let actualRunCount = 0;
			
			const fn = () => {
				actualRunCount += 1 
				if(actualRunCount <= 4) throw new Error('Testing retry');
			};
						
			const promise = retry(fn, {
				fn,
				retryDelayMs: 1,
				maxRetryDelay: 4,
				maxRetryCount: 10,
				backoff: true
			});
					
					
					
			await advanceTimeMs(1); // 1ms elapsed - Wait is now 2ms
			expect(actualRunCount).toBe(1);
			
			await advanceTimeMs(2); // 3ms elapsed - Wait is now 4ms
			expect(actualRunCount).toBe(2);
			
			await advanceTimeMs(4); // 7ms elapsed - Wait is now 4ms
			expect(actualRunCount).toBe(3);
			
			await advanceTimeMs(4); // 11ms elapsed - Wait is still 4ms
			expect(actualRunCount).toBe(4);
			
			await advanceTimeMs(4); // 15ms elapsed - Wait is still 4ms
			expect(actualRunCount).toBe(5);
			
			await promise;
		});
	});
	
	describe('Returing true breaks out of retry', () => {
	
		test('Returning true in onError breaks out of retry', async () => {
			let actualRunCount = 0;
			
			const fn = () => {
				actualRunCount += 1 
				if(actualRunCount <= 9)  throw new Error('Testing retry');
			};
			
			try {
				await retry(fn, {
					maxRetryCount: 10,
					onError: e => {
						return true;
					}
				});
			} catch(e) {
				expect(e.name).toBe('Error');
				expect(e.message).toBe('Testing retry');
			}
			
			expect(actualRunCount).toBe(1);
		});
		
	});

})
