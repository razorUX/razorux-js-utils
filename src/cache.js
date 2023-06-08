var memjs = require('memjs')

const { createErrorType } = require("./createErrorType.js");
const { validateEnvVars } = require("./envVars");
// Constants

const REQUIRED_ENV_VARS = [
	"MEMCACHIER_SERVERS",
	"MEMCACHIER_USERNAME",
	"MEMCACHIER_PASSWORD",
];

const ONE_HOUR_IN_SECONDS = 60 * 60;
const DEFAULT_CACHE_TIMEOUT_SECONDS = 12 * ONE_HOUR_IN_SECONDS;
const CACHE_EXPIRATION_TIMEOUT_SECONDS = process.env.CACHE_EXPIRATION_TIMEOUT_SECONDS || DEFAULT_CACHE_TIMEOUT_SECONDS;

const EXPIRATION_CONFIG = { 
	expires: CACHE_EXPIRATION_TIMEOUT_SECONDS
}

// Error definitions

const MemcacheKeyNotFoundError = createErrorType('MemcacheKeyNotFoundError');

// Runtime



// Functions

function createCacheClient() {
	validateEnvVars(REQUIRED_ENV_VARS);
	const memcacheClient = memjs.Client.create();
	
	return {
		memcacheClient,
		persist,
		retrieve,
	}
}

async function persist(key, json) {
	
	log("🌀 Persisting to cache...");
	const serializedData = serialize(json);
	log(`[${key}] => ${serializedData}`);
	const response = await this.memcacheClient.set( key, serializedData, EXPIRATION_CONFIG);
	log("✅ Done");
	return response;
}

async function retrieve(key) {
	validateEnvVars(REQUIRED_ENV_VARS);
	
	log(`🌀 Retrieving from cache... (${key})`);
	const response = await this.memcacheClient.get(key);
		
	if(response == null) throw new MemcacheKeyNotFoundError({ metadata: { key }});
	
	const { value, flags } = response;
	
	const serializedData = value.toString();
	
	log(`Got value: ${serializedData}`);
	log(`Got flags: ${flags.toString()}`)
	
	const results =  deserialize(serializedData);
	log("✅ Done");
	return results;
}

// Helpers

function serialize(json) {
	return JSON.stringify(json);
}

function deserialize(str) {
	return JSON.parse(str);
}

function log(str) {
	if(process.env.MEMCACHE_LOGGING_ENABLED) console.log(str);
}

exports.createCacheClient = createCacheClient;