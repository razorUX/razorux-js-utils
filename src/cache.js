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


// Runtime


// Functions

function createCacheClient() {
	validateEnvVars(REQUIRED_ENV_VARS);
	const memcacheClient = memjs.Client.create();
	
	return {
		memcacheClient,
		persist,
		retrieve,
		disconnect
	}
}

async function wrap({key, onCacheMiss, cacheTtlSeconds = 60}) {
	log(`🌀 Cache Wrap (Key: ${key})`);
	
	try {
	let response = await retrieve(key);
	log("🎯 Cache hit");
	return response;
} catch(error) {
	if(error.name !== 'MemcacheKeyNotFoundError') throw error;
	
	log(`❗ Cache miss!`);
	
	const value = await onCacheMiss();
	log(`🐬 Caching response...`);
	await persist(key, value, cacheTtlSeconds);
	
}

	
	return this.shouldCompressValues ? await compressedBase64ToJson(response) : response;
}

async function persist(key, json, cacheTtlSeconds) {
	
	log("🌀 Persisting to cache...");
	const serializedData = serialize(json);
	log(`[${key}] => ${serializedData}`);
	const response = await this.memcacheClient.set( key, serializedData, { 
		expires: cacheTtlSeconds || CACHE_EXPIRATION_TIMEOUT_SECONDS
	});
	log("✅ Done");
	return response;
}

async function retrieve(key) {
	validateEnvVars(REQUIRED_ENV_VARS);
	
	log(`🌀 Retrieving from cache... (${key})`);
	const response = await this.memcacheClient.get(key);
		
	const { value, flags } = response;
	
	if(value == null) return null;
	
	const serializedData = value.toString();
	
	log(`Got value: ${serializedData}`);
	log(`Got flags: ${flags.toString()}`)
	
	const results =  deserialize(serializedData);
	log("✅ Done");
	return results;
}

async function disconnect() {
	await this.memcacheClient.quit();
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