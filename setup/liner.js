
var stream = require('stream');
var util = require('util');


function Liner (options) {

	stream.Transform.call(this, options);

	this._lastLineData = null;
}


util.inherits(Liner, stream.Transform);


Liner.prototype._transform = function (chunk, encoding, done) {

	var data = chunk.toString();
	if (this._lastLineData) data = this._lastLineData + data;

	var lines = data.split('\n');
	this._lastLineData = lines.splice(lines.length-1,1)[0];

	var self = this;
	lines.forEach(function(line){
		self.push(line);
	});
	done();
}

 
Liner.prototype._flush = function (done) {
	if (this._lastLineData) this.push(this._lastLineData);
	this._lastLineData = null;
	done();
}

 
module.exports = Liner;