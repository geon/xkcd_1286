var readline = require('readline');
var Liner = require('./liner.js');
var stream = require('stream');





var cryptsExtractor = new stream.Transform( { objectMode: true } );
 
cryptsExtractor._transform = function (chunk, encoding, done) {

	var line = chunk.toString();

	var fields = line.split("-|-");

	var hexPassword	= '';
	try {
		var buffer = new Buffer(fields[3], 'base64');
		var hexPassword	= buffer.toString('hex');
	} catch(e){}

	var hint = fields[4] || '';
	hint = hint.substring(0, hint.length-3);

	var numPasswordFields = 2;
	// Some safeguards to not break the import. Lots of weird data in there...
	if (
		hexPassword.length > 16 * numPasswordFields || // Database design can't handle more than 2*8 encrypted password characters.
		// !fields[2]   || // Must have email.
		!hexPassword //|| // Must have password.
		// !hint           // Must have hint. (Even if blank.)
	) {
		done();
		return;
	}


	this.push(hexPassword.substr(0, 16)+'\n', encoding);
	if (hexPassword.length > 16) {

		this.push(hexPassword.substr(16, 16)+'\n', encoding);
	}

	done();
}
 
 

process.stdin
	.pipe(new Liner())
	.pipe(cryptsExtractor)
	.pipe(process.stdout);
