function randomNumberBetween(min, max) { // min and max included 
	if(!min) min = 0;
	if(!max) max = Number.MAX_SAFE_INTEGER;
	return Math.floor(Math.random() * (max - min + 1) + min)
}

exports.randomNumberBetween = randomNumberBetween;