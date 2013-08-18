thin.define("Chess.Controller", ["Chess.Service"], function (ChessService) {
	return {
		init: function (element) {
			var game = ChessService.createGame();
			game.init(element);
            return game;
		},

		undo: function () {
			this.game.undo();
		},

		redo: function () {
			this.game.redo();
		}
	};
});