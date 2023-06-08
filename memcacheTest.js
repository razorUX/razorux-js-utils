require('dotenv').config()

const { createCacheClient, persistToCache, retrieveFromCache } = require('./src/cache.js');

async function main () {

	console.log("Storing data to cache...");
	
	const data = {
		text: "Hello World!",
		passenger: "Mr. Frumble"
	}
	
	const key = "top_secret_key"
	
	const cache = createCacheClient();
	
	const storageResponse = await cache.persist(key, data);
	
	console.log(storageResponse);
	
	const retrieveResponse = await cache.retrieve(key);	
	
	console.log(retrieveResponse);
}

main();