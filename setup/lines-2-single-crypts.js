var readline = require('readline');
var stream = require('stream');
var Liner = require('./liner.js');
var Fielder = require('./fielder.js');


var fieldsToSingleCrypts = new stream.Transform({objectMode: true});
 
fieldsToSingleCrypts._transform = function (fields, encoding, done) {

	if (fields.hexPasswordHash.length <= 16) {

		this.push(fields.hexPasswordHash.substr(0, 16)+'\n');
	}
	done();
}
 

process.stdin
	.pipe(new Liner())
	.pipe(new Fielder())
	.pipe(fieldsToSingleCrypts)
	.pipe(process.stdout);
