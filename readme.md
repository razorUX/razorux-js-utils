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

retryable({fn, retryCount = 3, retryTimeoutMs = 300, addRandomDelay = true});

validateJson(json, requiredPaths);

createErrorType(name, suppressErrorNotification);

enableConsoleLogging();
disableConsoleLogging();
```

## Thank You

Development sponsored by [razorUX](razorux.com)