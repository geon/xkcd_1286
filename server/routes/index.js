
var _ = require('underscore-node');
var crypts = require('../crypts.js');

function page (req, res, finder, templateName) {

	var solutions = _.map(_.filter(_.pairs(req.body), function (pair) {

		// Only save fields with a solution.
		return (_.isArray(pair[1]) ? pair[1].join('') : pair[1]).length > 0;
	}), function (pair) {

		// TODO: Support saving multiple solutions for a crypt?
		return {crypt:pair[0], plain:_.isArray(pair[1]) ? pair[1].join('') : pair[1]};
	});

	if (solutions.length) {

		crypts.saveSolutions(solutions, function (err) {

			if (err) {

				res.status(500).send(':(');
				res.end();
				return;
			}

			show();
		});

	} else {

		show();
	}

	function show () {

		finder(function (err, data) {

			if (err) {

				res.status(500).send(':(');
				res.end();
				return;
			}

			res.render(templateName, {data: data});
		});
	}
};


exports.singles = function (req, res) {

	page(req, res, _.bind(crypts.findSingles, crypts), 'singles');
};


exports.doubles = function (req, res) {

	page(req, res, _.bind(crypts.findDoubles, crypts), 'doubles');
};


exports.partials = function (req, res) {

	page(req, res, _.bind(crypts.findPartials, crypts), 'partials');
};


exports.allForCrypt = function (req, res) {

	page(req, res, _.bind(crypts.findAllForCrypt, crypts, req.params.crypt), 'allForCrypt');
};
