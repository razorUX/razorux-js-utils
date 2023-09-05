const fs = require("fs");
const path = require("path");
const Papa = require('papaparse');
const get = require("lodash.get");

const {
	pipe,
	map
} = require('./pipe.js');

const resolveFilePath = filepath => path.resolve(__dirname, filepath)

const readTextFile = pipe(
	resolveFilePath,
	fs.readFileSync,
	buffer => buffer.toString(),
);

// CSV

function readCsvFile(path) {
	return Papa.parse(readTextFile(path), {
		header: true,
		dynamicTyping: true
	}).data;
}

function writeCsvFile({path, data}) {
	return fs.writeFileSync(path, Papa.unparse(data));
}

// JSON

const readJsonFile = pipe(
	readTextFile,
	JSON.parse
)

function writeJsonFile({path, data}) {
	return fs.writeFileSync(path, JSON.stringify(data || {}));
}

// # Exports

exports.resolveFilePath = resolveFilePath;

exports.readTextFile = readTextFile;

exports.readCsvFile = readCsvFile;
exports.writeCsvFile = writeCsvFile;

exports.readJsonFile = readJsonFile;
exports.writeJsonFile = writeJsonFile;