var readline = require('readline');
var Liner = require('./liner.js');
var Fielder = require('./fielder.js');
var stream = require('stream');



var numPasswordFields = parseInt(process.argv[2], 10) || 1;
console.log(numPasswordFields);

var cryptsExtractor = new stream.Transform( { objectMode: true } );
 
cryptsExtractor._transform = function (fields, encoding, done) {

	if (fields.hexPasswordHash.length == 16 * numPasswordFields && fields.hint.length > 0) {

		this.push(fields.hexPasswordHash+' '+fields.hint+'\n', encoding);
	}

	done();
}
 
 

process.stdin
	.pipe(new Liner())
	.pipe(new Fielder())
	.pipe(cryptsExtractor)
	.pipe(process.stdout);
