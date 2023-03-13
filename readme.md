# razorUX JS Utils
[![CI](https://github.com/razorUX/razorux-js-utils/actions/workflows/test.yml/badge.svg)](https://github.com/razorUX/razorux-js-utils/actions/workflows/test.yml)
[![npm version](https://badge.fury.io/js/razorux-js-utils.svg)](https://badge.fury.io/js/razorux-js-utils)

## Installation

```
npm install razorux-js-utils
```

## Included functions

```js
loadEnvVars(filePath);
validateEnvVars([ ENV_VAR ]);

readCsvFile(path);
writeCsvFile(data, path);

readTextFile(path);

ensureDirExists(path);

readJsonFile(path);
writeJsonFile(data, path);

normalizeToken(string);

dollarsToCents(number);
centsToDollars(number);

invokeMethod(Function);


pipe(<Array Function>);
map(Array, Function);

clone(Object)

asyncMap(Array, Function);
asyncForEach(Array, Function);

sendSlackNotification,
getCloudWatchLogDeeplink()
sendErrorNotification,

simpleHash(Any)

sleep(number) // (milliseconds)

parseBoolean(String);

retryable({fn, retryCount = 3, timeout = 300, addRandomDelay = true});

validateJson(json, requiredPaths);

createErrorType(name, suppressErrorNotification);

enableConsoleLogging();
disableConsoleLogging();
```

## Retry

This package includes a powerful retry function for retrying pretty much any function, including async promises.

- [x] Max retry count
- [x] Linear retry delay
- [x] Global Timeout

- [x] Truncated exponential backoff
- [x] Min and max backoff values

- [x] Jitter
- [x] Jitter min and max

- [x] Return true to break out of retry
- [] Error matchers

```javascript
const {	
	retry
} = require('main');

function myAsyncFunction() { ... }

// Simple use case
await retry(myAsyncFunction);

const ONE_SECOND = 1000;
const ONE_MINUTE = 1000 * 60;

// Retry all errors with backoff + jitter
await retry(myAsyncFunction, {
	backoff: true,
	jitter: true,
	minRetryDelay: ONE_SECOND,
	maxRetryDelay: 3 * ONE_MINUTE, // No retry delay of longer than 3m
	timeout: 10 * ONE_MINUTE, // Give up after 10 minutes
});


// Full options
await retry(
	myAsyncFunction,
	{ 
		
		// A function to retry
		// Every time an exception is thrown, it will be
		// retried, subject to the following parameters
		
		onError = ()=>{
			// Optional. 
			// Will be passed every exception captured from `fn`
			// You can return `true` to break out of the retry block early
		},
		
		
		maxRetryCount: Number.MAX_SAFE_INTEGER
		// Amount of times to retry before giving up
		// If, the amount of retries are exhausted, will throw a RetryLimitReachedError,
		// with the original error wrapped inside it
		
		timeout = 1000,
		// Amount of milliseconds to wait between giving up.
		// If the timeout expires will throw a RetryTimeoutError, with the original error wrapped inside it.
		// Example: "Retry this network request until 5 minutes have passed"
		
		// Note:
		// If maxRetryCount and timeout are both set, the operation will abort
		// with whichever one occurs sooner
		
		retryDelayMs: 50,
		// Amount of milliseconds to wait between retries.
		// If `backoff` is true, this will be ignored
		
		backoff = false,
		// Wait exponentially more between retries
		// i.e. 1000ms, 2000ms, 4000ms, 8000ms, etc.
		// Perfect for rate-limited APIs
		
		factor: 2,
		// Exponent to use for backoff
		
		minRetryDelay: 0,
		// The initial delay value in milliseconds
		
		maxRetryDelay: 1000 * 60 * 2, // Two minutes
		// The maximum delay value in milliseconds.
		// You should always set this to prevent the retry delay from becoming really huge
		
		
		jitter: false,
		// Add a randomized amount to the delay
		// This is important to avoid deadlock if many instances of your program will be trying to access the same resource at once
		
		minJitterMs:  0,
		maxJitterMs:  50,
		// Min and max jitter values
		// Max doesn't need to be very large, just enough to break deadlock
		
		debugLogging: false 
		// Print comprehensive internal logs to the console
		// Great for debugging
}) 
```


## Thank You

Development sponsored by [razorUX](razorux.com)