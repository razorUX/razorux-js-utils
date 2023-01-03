const fs = require("fs");
const path = require("path");
const Papa = require('papaparse');
const get = require("lodash.get");

const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);
const resolveFilePath = filepath => path.resolve(__dirname, filepath)

const map = fn => arr => arr.map(fn);

const readTextFile = pipe(
	resolveFilePath,
	fs.readFileSync,
	buffer => buffer.toString(),
);

const readJsonFile = pipe(
	readTextFile,
	JSON.parse
)

function readCsvFile(path) {
	return Papa.parse(readTextFile(path), {
		header: true,
		dynamicTyping: true
	}).data;
}

function writeCsvFile({path, data}) {
	return fs.writeFileSync(path, Papa.unparse(data));
}

function writeJsonFile({path, data}) {
	return fs.writeFileSync(path, JSON.stringify(data || {}));
}

// Import env vars from .env.json

function loadEnvVars(path) {
	const envVars = readJsonFile(path);
	Object.entries(envVars).forEach(([key, value])=>{
		process.env[key] = value;
	});
}

function validateEnvVars(envVars) {
	envVars.forEach(envVar => {
		if(!process.env[envVar]) throw `Missing required env var "${envVar}"`;
	})
}

function ensureDirExists(path) {
	if(!fs.existsSync(path)) fs.mkdirSync(path)
}


const normalizeToken = str => {
	if(!str) return str;
	return str.trim().toLowerCase();
}

async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}

async function asyncMap(array, callback) {
	const results = [];
	for (let index = 0; index < array.length; index++) {
		results.push(await callback(array[index], index, array));
	}
	return results;
}


async function sleep(ms) {
	return await new Promise(resolve => setTimeout(resolve, ms));
}


const assertObjectMatchesPaths = paths => (args, i) => {
	if(!args) throw new TypeError(`Missing argument object (Got ${args})`)
	paths.forEach(path => {
		const value = get(args, path);
		const itemIndexStr = i !== undefined ? 'Item ' + i + ' ': '';
		if(value == undefined || value == null) throw new TypeError(`${itemIndexStr}Missing required argument key '${ path }' (Got ${ value })`);
	})
}


function parseBoolean(str) {
	if(str === undefined) throw `Parse boolean failed. Must be called with String or Boolean but got \`${str}\``
	if (typeof str === "boolean") return str;
	const normalized = normalizeToken(str);
	if (normalized == 'true') return true;
	if (normalized == 'false') return false;
	throw `parseBoolean failed. Unable to convert string "${str}" to Boolean.`;
}


const sortByObjectPath = path => (a,b) => {
	if(a[path] > b[path]) return 1;
	if(a[path] < b[path]) return -1;
	return 0;
}


async function downto(n1, n2, fn) {
	console.log(`downto(${n1}, ${n2})`);
	for(i = n1; i >= n2; i -= 1) {
		if(await fn(i)) break;
	}
}

async function upto(n1, n2, fn) {
	for(i = n1; i <= n2; i += 1) {
		if(await fn(i)) break;
	}
}

function cloneProperties(source, paths) {
	const result = {}
	paths.forEach(key => {
		result[key] = source[key];
	})
	return result;
}


// Dollar/cent conversion 
// And yes, I find `dollarsToCents(n)` to be clearer than `n / 100`

const CENTS_IN_DOLLAR = 100;

function dollarsToCents(dollars) {
	return dollars * CENTS_IN_DOLLAR;
}

function centsToDollars(cents) {
	return cents / CENTS_IN_DOLLAR;
}

const clone = o => JSON.parse(JSON.stringify(o))
const invokeMethod = functionName => obj => obj[functionName]();



async function sendSlackNotification(text) {
	const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
	if(!SLACK_WEBHOOK_URL) {
		console.error(`❗️ sendSlackNotification called but SLACK_WEBHOOK_URL env var is not set (Got: ${SLACK_WEBHOOK_URL})`);
		return;
	};
	const message = text + ` <${getCloudWatchLogDeeplink()}| Logs ›>`;
	console.log('🌀 Sending Slack notification...');
	console.log(message);
	return await fetch(SLACK_WEBHOOK_URL, {
		method: 'post',
		headers: {'content-type': 'application/json'},
		body: JSON.stringify({"text": message})
	}) 
}



async function sendErrorNotification({text, args = "", id = ""}) {
	if(process.env.SUPPRESS_ERROR_NOTIFICATIONS && parseBoolean(process.env.SUPPRESS_ERROR_NOTIFICATIONS)) return;
	const ERROR_WEBHOOK_URL = process.env.ERROR_WEBHOOK_URL;
	if(!ERROR_WEBHOOK_URL) {
		console.error(`❗️ sendErrorNotification called but ERROR_WEBHOOK_URL env var is not set (Got: ${ERROR_WEBHOOK_URL})`);
		return;
	};

	if(!text) throw `Argument \`text\` cannot be empty (got ${text})`;

	const populatedMessage = text.
		replace("%s", args).
		replace("%id", id) +
		`<${getCloudWatchLogDeeplink()}| Logs ›>`;

	await fetch(ERROR_WEBHOOK_URL, {
		method: 'post',
		headers: {'content-type': 'application/json'},
		body: JSON.stringify({"text": populatedMessage})
	}) 
}

// Cloudwatch deeplink

const cloudwatchRoot = 'https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/'

function cloudWatchURLEncode(str) {
	return str.
		replace(/\$/g, '$2524').
		replace(/\//g, '$252F').
		replace(/\[/g, '$255B').
		replace(/\]/g, '$255D')
}

function getCloudWatchLogDeeplink() {
	if(!process.env.AWS_LAMBDA_LOG_GROUP_NAME || !process.env.AWS_LAMBDA_LOG_STREAM_NAME) return "";
	let encodedUrl = cloudwatchRoot + cloudWatchURLEncode(process.env.AWS_LAMBDA_LOG_GROUP_NAME) + '/log-events/' + cloudWatchURLEncode(process.env.AWS_LAMBDA_LOG_STREAM_NAME);
	return encodedUrl;
}


function cyrb53(str, seed = 0) {
	let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
			ch = str.charCodeAt(i);
			h1 = Math.imul(h1 ^ ch, 2654435761);
			h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ h1>>>16, 2246822507) ^ Math.imul(h2 ^ h2>>>13, 3266489909);
	h2 = Math.imul(h2 ^ h2>>>16, 2246822507) ^ Math.imul(h1 ^ h1>>>13, 3266489909);
	return 4294967296 * (2097151 & h2) + (h1>>>0);
};


function simpleHash(str) {
	if(!str) throw "Called with no args";
	const hash = cyrb53(str).toString(16);
	return hash.substring(0,8).toUpperCase();
}

const RANDOM_JITTER_MS_MAX = 100; // Totally arbitrary. We just want randomize the timing a little to avoid deadlocks 

const retryable = async ({fn, retryCount = 3, retryTimeoutMs = 300, addRandomDelay = true}) => {
	let retriesRemaining = retryCount;
	
	let response, error;
	console.log(`🔁 Entering retry block`);

	const overridedSleepMs = process.env.RETRYABLE_BLOCK_SLEEP_DURATION_OVERRIDE_MS || 0;

	while(response === undefined && retriesRemaining > 0) {
		try {
			error = undefined;
			console.log(`🔁 Retry block try ${retryCount - retriesRemaining + 1}/${retryCount}`);
			response = await fn();
			console.log(response);
			retriesRemaining -= 1;
		} catch(e) {
			error = e;
			console.error(e);
			retriesRemaining -= 1;
			console.log(`🔁❗️ Retry fail. Sleeping.`);
			const sleepMs = retryTimeoutMs + (addRandomDelay ? getRandomIntBetween(0, RANDOM_JITTER_MS_MAX) : 0);
			await sleep(overridedSleepMs ? overridedSleepMs : sleepMs);
		}
	}
	if(error) {
		console.error("❗️ All retries failed. Exiting retryable block.");
		throw error;
	}
	console.log("✅ Retryable block exiting OK");
	return response;
}


function getRandomIntBetween(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min); 
}

function validateJson(json, requiredPaths) {
	requiredPaths.forEach(path => {
		if(get(json, path) === undefined) {
			throw new TypeError(`JSON is missing required path '${path}' (Got ${get(json, path)})`);
		}
	})
}

function createErrorType(name, suppressErrorNotification) {
	const errorFn =  function ({message, error}) {
		this.name = name;
		this.message = message;
		this.deliberate = true;
		this.suppressErrorNotification = suppressErrorNotification || false;
		this.exposeErrorMessageToClient = true;
		this.internalError = error;
	}
	errorFn.prototype = Error.prototype;
	return errorFn;
}


const originalConsoleLogFn = console.log;
const originalConsoleErrorFn = console.error; 

function enableConsoleLogging() {
	console.log = originalConsoleLogFn;
	console.error = originalConsoleErrorFn;
}

function disableConsoleLogging() {
	console.log = ()=>{};
	console.error = ()=>{};
}


// const configureFetchMockBehavior = apiMocks => behaviors => {
// 	Object.entries(behaviors).forEach(([endpoint, statusCode]) => {
// 		const createMockResponseFn = apiMocks[endpoint][statusCode];
// 		if(!createMockResponseFn) throw `Unknown mock ${endpoint}.${statusCode}`;
// 		fetchMock.mock(createMockResponseFn());
// 	})
// }


exports.readJsonFile = readJsonFile;
exports.writeJsonFile = writeJsonFile;

exports.loadEnvVars = loadEnvVars;
exports.validateEnvVars = validateEnvVars;

exports.readCsvFile = readCsvFile;
exports.writeCsvFile = writeCsvFile;

exports.readTextFile = readTextFile;

exports.normalizeToken = normalizeToken;

exports.ensureDirExists = ensureDirExists;

exports.dollarsToCents = dollarsToCents;
exports.centsToDollars = centsToDollars;


exports.pipe = pipe;
exports.map = map;
exports.invokeMethod = invokeMethod;

exports.clone = clone;

exports.asyncMap = asyncMap;
exports.asyncForEach = asyncForEach;

exports.sendSlackNotification = sendSlackNotification;
exports.getCloudWatchLogDeeplink = getCloudWatchLogDeeplink;
exports.sendErrorNotification = sendErrorNotification;

exports.simpleHash = simpleHash;

exports.sleep = sleep;

exports.parseBoolean = parseBoolean;

exports.retryable = retryable;

exports.validateJson = validateJson;

exports.createErrorType = createErrorType;

exports.enableConsoleLogging = enableConsoleLogging;
exports.disableConsoleLogging = disableConsoleLogging;

// exports.configureFetchMockBehavior = configureFetchMockBehavior;