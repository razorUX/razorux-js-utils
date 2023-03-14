const { sleep } = require('./sleep.js');
const { clamp, getRandomIntBetween } = require('./numbers.js');
const { createErrorType } = require('./createErrorType.js');

const ONE_SECOND_IN_MILLISECONDS = 1000;
const ONE_MINUTE_IN_MILLISECONDS = ONE_SECOND_IN_MILLISECONDS * 60;
const TWO_MINUTES_IN_MILLISECONDS = ONE_MINUTE_IN_MILLISECONDS * 2;

const DEFAULTS = {
	maxRetryCount: Number.MAX_SAFE_INTEGER,
  retryDelayMs: 50,
	retryTimeout: ONE_SECOND_IN_MILLISECONDS
}

const RetryLimitReachedError = createErrorType("RetryLimitReachedError");
const RetryTimeoutError = createErrorType("RetryTimeoutError");

/*
Features: 
- [x] Max retry count
- [x] Linear retry delay
- [x] Global Timeout

- [x] Truncated exponential backoff
- [x] Min and max backoff values

- [x] Jitter
- [x] Jitter min and max

- [x] Return true to break out of retry
- [] Error matchers
*/

const now = () => new Date();

async function retry(fn, options) {	
	if(!options) options = {};
	
	const { 
		onError = ()=>{},
		maxRetryCount = DEFAULTS.maxRetryCount,
		retryDelayMs = DEFAULTS.retryDelayMs,
		timeout = DEFAULTS.retryTimeout,
		backoff = false,
		factor = 2,
		minRetryDelay = 0,
		maxRetryDelay = TWO_MINUTES_IN_MILLISECONDS,
		jitter = false,
		minJitterMs = 0,
		maxJitterMs = 50,
		jitterRandomSeed,
		debugLogging = false,
	} = options;
		
	const log = str => { if(debugLogging) console.log(str) };
	
	log(`🔁 Retry starting`)
	let retriesElapsed  = 0;
	let startTimestamp = new Date();
	let retryTimeoutTimestamp = new Date(startTimestamp.getTime() + timeout);
	log(`ℹ️ Started at : ${startTimestamp.getTime()}`)
	log(`⌚️ Timeout expires at: ${retryTimeoutTimestamp.getTime()}`)
	
	let results;
	
	while(true) {
		retriesElapsed += 1;
		log(`🌀 Attempt #${retriesElapsed}...`)
		
		try {
			results = await fn();
			break;
			
		} catch(e) {
			log('❗ Retry failed.')
			console.error(e);
			
			const shouldBreak = await onError(e, retriesElapsed);
			if(shouldBreak) return;
			
			checkForRetryLimit({ retriesElapsed, maxRetryCount, error: e });
			checkForGlobalTimeout({ retryTimeoutTimestamp,  timeout, startTimestamp});
			
			
			let sleepAmountMs = retryDelayMs;
			
			log(`🧠 Calculating delay amount (min: ${ minRetryDelay || retryDelayMs || 0 }ms, max: ${ maxRetryDelay }ms, retryAttempt: ${retriesElapsed}, backoff: ${ backoff }, jitter: ${jitter})`)
			
			if(backoff) {
				const defaultSleepAmount = minRetryDelay || retryDelayMs;
				sleepAmountMs = Math.pow(factor, retriesElapsed) * defaultSleepAmount;				
				log(`🧪 Exponential backoff is enabled (Attempt #${retriesElapsed}, maxDelay: ${maxRetryDelay}ms). Exponential sleep amount would be: ${sleepAmountMs}ms`)
			}
			
			let jitterAmountMs = 0;
			if(jitter) {
				const randomJitterAmountMs = getRandomIntBetween(	minJitterMs, maxJitterMs, `${jitterRandomSeed}${retriesElapsed}` );
				log(`🥤 Jitter enabled. Adding random jitter amount: ${randomJitterAmountMs}ms`)
				sleepAmountMs += randomJitterAmountMs;
			}
			
			log(`🗜 Clamping by min (${minRetryDelay || retryDelayMs || 0 }ms) and max (${maxRetryDelay}ms)`)
			
			sleepAmountMs = clamp(sleepAmountMs, { 
				min: minRetryDelay,
				max: maxRetryDelay 
			});
			
			log(`⚖️ Final sleep value: ${sleepAmountMs}ms`)
			
			log(`😴 Sleeping ${sleepAmountMs}ms...`);
			await sleep(sleepAmountMs);
			log(`⏰ Sleep done. Retrying...`);
		}		
	}
	
	log(`✅ Callback success. Exiting retry.`)	
	return results;
}

function checkForRetryLimit({retriesElapsed, maxRetryCount, error}) {
	if(retriesElapsed >= maxRetryCount) {
		console.error(`Retry limit reached. (Tried ${retriesElapsed} times; max is ${maxRetryCount}).\n ${ error }`);
		console.error(error);
		throw new RetryLimitReachedError({
			message: `Retry limit reached. (Tried ${retriesElapsed} times; max is ${maxRetryCount}).`,
			error
		});
	}
}

function checkForGlobalTimeout({ retryTimeoutTimestamp,  timeout, startTimestamp}) {
	if(now() > retryTimeoutTimestamp) {
		const elapsedTimeMs = now() - startTimestamp;
		throw new RetryTimeoutError({ 
			message: `Retry timeout of ${timeout}ms exceeded (Total elapsed time: ${elapsedTimeMs}ms)`
		});
	}
}

exports.retry = retry;