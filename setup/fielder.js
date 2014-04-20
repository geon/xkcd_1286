
var stream = require('stream');
var util = require('util');


function Fielder () {

	stream.Transform.call(this, {objectMode: true});
}


util.inherits(Fielder, stream.Transform);


Fielder.prototype._transform = function (chunk, encoding, done) {

	var line = chunk.toString();
	var fields = line.split('-|-');

	// There are some safeguards to not break the import. Lots of weird data in there...
	// Broken lines give bad data to other fields otherwise.


	var hexPasswordHash	= false;
	var base64PasswordHash = fields[3];
	try {
		var buffer = new Buffer(base64PasswordHash, 'base64');
		var hexPasswordHash	= buffer.toString('hex');
	} catch(e){}
	if (
		!hexPasswordHash ||             // Must have password.
		hexPasswordHash.length > 16 * 2 // Database design can't handle more than 2*8 encrypted password characters.
	) {
		done();
		return;
	}


	var hint = fields[4];
	if (
		hint == undefined // Must have a hint field, even if blank.
	) {
		done();
		return;
	}
	hint = hint.substr(0, hint.length-3); // Cut off the end of line marker.


	if (
		fields[2] == undefined // Must have email.
	) {
		done();
		return;
	}


	this.push({
		hexPasswordHash: hexPasswordHash,
		hint: hint
	});
	done();
}

 
module.exports = Fielder;
