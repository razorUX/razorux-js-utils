
// ## constants
const CLAMP_DEFAULTS = {min: 0 , max: Number.MAX_SAFE_INTEGER}

// ## Functions

// isNumber(n)
function isNumber(n) {
	return Number.isFinite(n);
}


// getRandomIntBetween(min?, max?)
function getRandomIntBetween(min, max, seed) {
	// console.log(`getRandomIntBetween(${min}, ${max}, ${seed})`);
	min = Math.ceil(min || 0);
	max = Math.floor(max || Number.MAX_SAFE_INTEGER);
	const generateRandomNumber = createRandomNumberGenerator(seed ? cyrb53(seed) : new Date().getTime());
	return Math.floor(
		generateRandomNumber() * (max - min + 1) + min
	); 
}

// clamp(n, { min?, max? })
const clamp = (num, options ) => {
	if(!isNumber(num)) throw new TypeError(`Invalid argument. Must be called with a valid number. (Got: ${num}).`);
	
	return Math.min(
		Math.max(num, options?.min || CLAMP_DEFAULTS.min ),
		options?.max || CLAMP_DEFAULTS.max
	);
};

// Generate pseudorandom number using the Mulberry32 algorithm
// https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32
function createRandomNumberGenerator(seed) {
		return function generateRandomNumber() {
			seed |= 0; seed = seed + 0x6D2B79F5 | 0;
			var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
			t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
			return ((t ^ t >>> 14) >>> 0) / 4294967296;
		}
}

// Generate a seed
function generateXmur3(str) {
		for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
				h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
				h = h << 13 | h >>> 19;
		return function() {
				h = Math.imul(h ^ h >>> 16, 2246822507),
				h = Math.imul(h ^ h >>> 13, 3266489909);
				return (h ^= h >>> 16) >>> 0;
		}
}

// Generate a cryb53 hash of a String
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



// ## exports
exports.clamp = clamp;
exports.isNumber = isNumber;
exports.getRandomIntBetween = getRandomIntBetween;
exports.createRandomNumberGenerator = createRandomNumberGenerator;