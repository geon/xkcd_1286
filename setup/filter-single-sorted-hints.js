var readline = require('readline');
var Liner = require('./liner.js');
var stream = require('stream');
var fs = require('fs');
var _ = require('underscore-node')



var crypts = fs.readFile('frequencies_single.csv', {encoding: 'utf8'}, function (error, data) {

	var crypts = _.map(data.split('\n'), function (line) {

		return line.substr(0, 16);
	});

	var currentCryptIndex = 0;
	var currentCrypt = crypts[currentCryptIndex];

	var hintEliminator = new stream.Transform();
	 
	hintEliminator._transform = function (chunk, encoding, done) {

		var line = chunk.toString();

		var crypt = line.substr(0, 16);
		var hint  = line.substr(17);

		while (crypt > currentCrypt) {
			
			++currentCryptIndex;
			currentCrypt = crypts[currentCryptIndex];
		}

		if (crypt == currentCrypt) {

			this.push(line+'\n');
		}

		done();
	};


	process.stdin
		.pipe(new Liner())
		.pipe(hintEliminator)
		.pipe(process.stdout);
});

// This is a slightly elaborate implementation of filtering the stdin stream by the crypt part existing in the frequencies.csv file. It can just as well be implemented as a set/hash but this should be a little bit faster. Probably doesn't matter the slightest. I just thought it was fun to use the algorithm.

/*

var crypts = fs.readFile('frequencies_single.csv', {encoding: 'utf8'}, function (error, data) {

	var crypts = {};

	_.each(_.map(data.split('\n'), function (line) {

		return line.substr(line.indexOf(',')+1);
	}), function (crypt) {

		crypts[crypt] = true;
	});

	var hintEliminator = new stream.Transform();
	 
	hintEliminator._transform = function (chunk, encoding, done) {

		var line = chunk.toString();

		var crypt = line.substr(0, 16);

		if (crypts[crypt]) {

			this.push(line+'\n');
		}

		done();
	};

	process.stdin
		.pipe(new Liner())
		.pipe(hintEliminator)
		.pipe(process.stdout);
});

*/

