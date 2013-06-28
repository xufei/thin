

thin.define("ChessFactory", ["ChessType", "ChessColor", "General", "Guard", "Staff", "Horse", "Chariot", "Cannon", "Soldier"], function (ChessType, ChessColor, General) {
	var ChessConstructors = [].slice.call(arguments).slice(2);

	var ChessFactory = {
		createChess: function (data) {
			var chess;

			var type = data[1];

			chess = new (ChessConstructors[7 - type])(data[0], data[1]);
			chess.x = data[2];
			chess.y = data[3];
			return chess;
		}
	};

	return ChessFactory;
});