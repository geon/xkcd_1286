var readline = require('readline');
var Liner = require('./liner.js');
var stream = require('stream');

var threshold = parseInt(process.argv[2], 10) || 0;

var lessThanIgnorer = new stream.Transform( { objectMode: true } );


lessThanIgnorer._transform = function (chunk, encoding, done) {

	var line = chunk.toString();

	var fields = line.trim().split(" ");

	var frequency = fields[0];
	var crypt = fields[1];

	if (parseInt(frequency, 10) >= threshold) {


		this.push(crypt.substr(0, 16)+','+crypt.substr(16, 16)+','+frequency+'\n', encoding);
	}

	done();
}

process.stdin
	.pipe(new Liner())
	.pipe(lessThanIgnorer)
	.pipe(process.stdout);
