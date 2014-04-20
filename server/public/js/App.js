function App () {

	var unsolvedPieces = new UnsolvedPieces();

	this.unsolvedPiecesListView = new UnsolvedPiecesListView({
		el: $(".js-unsolved-pieces-list-view"),
		collection: unsolvedPieces		
	});

	unsolvedPieces.fetch();
}
