
var PasswordPiece = Backbone.Model.extend({	
});

var Activities = Backbone.Collection.extend({

	model: Activity,

	url: "../rest-server.php?top-unsolved-password-beginnings"
});
