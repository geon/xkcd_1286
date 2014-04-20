
var fs = require('fs');
var _ = require('underscore-node');
var pg = require('pg'); 

var conString = "postgres://geon@localhost/xkcd_1286";


exports.findSingles = function (callback, limit) {

	limit = limit || 100;

	var client = new pg.Client(conString);
	client.connect(function (err) {

		if (err) {

			console.error('Could not connect to postgres.', err);
			callback(err);
			return;
		}

		client.query('SELECT f.crypt FROM frequenciesSingle AS f LEFT JOIN solutions AS s on s.crypt = f.crypt WHERE s.plain IS NULL ORDER BY frequency DESC LIMIT '+limit, function(err, result) {

			if (err) {

				console.error('Query failed.', err);
				callback(err);
				return;
			}

			var singles = _.map(result.rows, function (row) {

				var fileContents = '';
				try {

					fileContents = fs.readFileSync('../single/'+row.crypt.substr(0, 2)+'/'+row.crypt).toString();

				} catch (err) {

					console.error('Disk read failed.', err);
				}

				return {
					crypt: row.crypt,
					hints: !fileContents ? [] : fileContents.split('\n').slice(0, 100)
				};
			});

			client.end();
			callback(null, singles);
		});
	});
};


exports.findDoubles = function (callback, limit) {

	limit = limit || 100;

	var client = new pg.Client(conString);
	client.connect(function (err) {

		if (err) {

			console.error('Could not connect to postgres.', err);
			callback(err);
			return;
		}

		client.query('SELECT f.first, f.second FROM frequenciesDouble AS f LEFT JOIN solutions AS s1 on s1.crypt = f.first LEFT JOIN solutions AS s2 on s2.crypt = f.second WHERE s1.plain IS NULL AND s2.plain IS NULL ORDER BY frequency DESC LIMIT 100', function(err, result) {

			if (err) {

				console.error('Query failed.', err);
				callback(err);
				return;
			}

			var doubles = _.map(result.rows, function (row) {

				var fileContents = '';
				try {

					fileContents = fs.readFileSync('../double/'+row.first.substr(0, 3)+'/'+row.first+row.second).toString();

				} catch (err) {

					console.error('Disk read failed.', err);
				}

				return {
					first: row.first,
					second: row.second,
					hints: !fileContents ? [] : fileContents.split('\n').slice(0, 100)
				};
			});

			client.end();
			callback(null, doubles);
		});
	});
};


exports.findPartials = function (callback, limit) {

	limit = limit || 100;

	var client = new pg.Client(conString);
	client.connect(function (err) {

		if (err) {

			console.error('Could not connect to postgres.', err);
			callback(err);
			return;
		}

		client.query('SELECT f.first, f.second, s1.plain AS "firstSolved", s2.plain AS "secondSolved" FROM frequenciesDouble AS f LEFT JOIN solutions AS s1 on s1.crypt = f.first LEFT JOIN solutions AS s2 on s2.crypt = f.second WHERE ((s1.plain IS NOT NULL AND s2.plain IS NULL) OR (s1.plain IS NULL AND s2.plain IS NOT NULL)) ORDER BY frequency DESC LIMIT '+limit, function(err, result) {

			if (err) {

				console.error('Query failed.', err);
				callback(err);
				return;
			}

			var partials = _.map(result.rows, function (row) {

				var filePath = '../double/'+row.first.substr(0, 3)+'/'+row.first+row.second;
				var fileContents = '';
				try {
					
					fileContents = fs.readFileSync(filePath).toString();

				} catch (e) {

					console.error('Disk read failed.', err);
				}

				return {
					firstSolved: row.firstSolved,
					secondSolved: row.secondSolved,
					first: row.first,
					second: row.second,
					hints: !fileContents ? [] : fileContents.split('\n').slice(0, 100),
					filePath: filePath
				};
			});

			client.end();
			callback(null, partials);
		});
	});
};


exports.findPartialsWithCrypt = function (crypt, callback, limit) {

	limit = limit || 10;

	var client = new pg.Client(conString);
	client.connect(function (err) {

		if (err) {

			console.error('Could not connect to postgres.', err);
			callback(err);
			return;
		}

		client.query('SELECT f.first, f.second, s1.plain AS "firstSolved", s2.plain AS "secondSolved" FROM frequenciesDouble AS f LEFT JOIN solutions AS s1 on s1.crypt = f.first LEFT JOIN solutions AS s2 on s2.crypt = f.second WHERE (s2.plain IS NULL AND f.first = $1) OR (s1.plain IS NULL AND f.second = $1) ORDER BY frequency DESC LIMIT 10', [crypt], function(err, result) {

			if (err) {

				console.error('Query failed.', err);
				callback(err);
				return;
			}

			var partials = _.map(result.rows, function (row) {

				var filePath = '../double/'+row.first.substr(0, 3)+'/'+row.first+row.second;
				var fileContents = '';
				try {
					
					fileContents = fs.readFileSync(filePath).toString();

				} catch (e) {

					console.error('Disk read failed.', err);
				}

				return {
					firstSolved: row.firstSolved,
					secondSolved: row.secondSolved,
					first: row.first,
					second: row.second,
					hints: !fileContents ? [] : fileContents.split('\n').slice(0, 100),
					filePath: filePath
				};
			});

			client.end();
			callback(null, partials);
		});
	});
};


exports.findAllForCrypt = function (crypt, callback, limit) {

	limit = limit || 10;

	var all = {};

	var waitCount = 1;
	function completed () {

		--waitCount;
		if (!waitCount) {

			callback(null, all);
		}
	}

	// exports.findSingles(function (err, data, limit, crypt) {

	// 	if (err) {

	// 		console.error(err);

	// 	} else {

	// 		all.singles = data;
	// 	}

	// 	completed();
	// });

	// exports.findDoubles(function (err, data, limit, crypt) {

	// 	if (err) {

	// 		console.error(err);
			
	// 	} else {

	// 		all.doubles = data;
	// 	}

	// 	completed();
	// });

	exports.findPartialsWithCrypt(crypt, function (err, data, limit) {

		if (err) {

			console.error(err);
			
		} else {

			all.partials = data;
		}

		completed();
	});
};


// solutions: [{crypt: "16 char hex", plain: "8 char plaintext"}]
exports.saveSolutions = function (solutions, callback) {

	var valueSQLs = [];
	for (var i = 0; i < solutions.length; i++) {
		valueSQLs.push('($'+(2*i+1)+', $'+(2*i+2)+')');
	};
	var SQL = 'INSERT INTO solutions (crypt, plain) VALUES '+valueSQLs.join(', ')+';';

	var values = _.flatten(_.map(solutions, function (solution) {

		return [solution.crypt, solution.plain];
	}));

	var client = new pg.Client(conString);
	client.connect(function (err) {

		if (err) {

			console.error('Could not connect to postgres.', err);
			callback(err);
			return;
		}

		client.query(SQL, values, function (err, result) {

			if (err) {

				console.error('Save failed.', err);
				callback(err);
				return;
			}

			client.end();
			callback();
		});
	});
};


// To find double solutions:
// select plain, count(*) as num, array_agg(crypt) from solutions group by plain having count(*) > 1 order by num desc;

