const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);

const map = fn => arr => arr.map(fn);

const clone = o => JSON.parse(JSON.stringify(o))

const invokeMethod = functionName => obj => obj[functionName]();

exports.pipe = pipe;
exports.map = map;
exports.clone = clone;
exports.invokeMethod = invokeMethod;
