const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);

const map = fn => arr => arr.map(fn);

const reduce = fn => arr => arr.reduce(fn);

const invokeMethod = functionName => obj => obj[functionName]();

const clone = o => JSON.parse(JSON.stringify(o))


// Working with Objects

const objectToEntries = obj => Object.entries(obj);

const entriesToObject = obj => Object.fromEntries(obj);

exports.pipe = pipe;
exports.map = map;
exports.reduce = reduce;
exports.clone = clone;
exports.invokeMethod = invokeMethod;
exports.objectToEntries = objectToEntries;
exports.entriesToObject = entriesToObject;
