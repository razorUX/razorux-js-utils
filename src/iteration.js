async function asyncMap(array, callback) {
	const results = [];
	for (let index = 0; index < array.length; index++) {
		results.push(await callback(array[index], index, array));
	}
	return results;
}

async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}

async function asyncParallelForEach(array, callback) {
	
	const promises = array.map((item, index, array) => {
		return callback(array[index], index, array);
	})

	return Promise.all(promises);
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

exports.asyncMap = asyncMap;
exports.asyncForEach = asyncForEach;
exports.asyncParallelForEach = asyncParallelForEach;

exports.downto = downto;
exports.upto = upto;