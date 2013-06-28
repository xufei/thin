thin.define("ChessController", ["ChessBoard", "ChessFactory", "ChessService", "ChessColor"], function (ChessBoard, ChessFactory, ChessService, ChessColor) {
	//color, type, x, y
	var chesses = [
		[1, 7, 4, 9],
		[1, 6, 3, 9],
		[1, 6, 5, 9],
		[1, 5, 2, 9],
		[1, 5, 6, 9],
		[1, 4, 1, 9],
		[1, 4, 7, 9],
		[1, 3, 0, 9],
		[1, 3, 8, 9],
		[1, 2, 1, 7],
		[1, 2, 7, 7],
		[1, 1, 0, 6],
		[1, 1, 2, 6],
		[1, 1, 4, 6],
		[1, 1, 6, 6],
		[1, 1, 8, 6],

		[-1, 7, 4, 0],
		[-1, 6, 3, 0],
		[-1, 6, 5, 0],
		[-1, 5, 2, 0],
		[-1, 5, 6, 0],
		[-1, 4, 1, 0],
		[-1, 4, 7, 0],
		[-1, 3, 0, 0],
		[-1, 3, 8, 0],
		[-1, 2, 1, 2],
		[-1, 2, 7, 2],
		[-1, 1, 0, 3],
		[-1, 1, 2, 3],
		[-1, 1, 4, 3],
		[-1, 1, 6, 3],
		[-1, 1, 8, 3]
	];

	return {
		init: function (element) {
			ChessService.factory = ChessFactory;

			ChessService.click(function (event) {
				var canGo = event.canGo;
				var canKill = event.canKill;

				ChessBoard.clearBlank();
				ChessBoard.clearAttack();

				for (var i = 0; i < canGo.length; i++) {
					ChessBoard.drawBlank(canGo[i].x, canGo[i].y);
				}

				for (var i = 0; i < canKill.length; i++) {
					ChessBoard.drawAttack(canKill[i].x, canKill[i].y);
				}
			});

			ChessService.move(function (event) {
				ChessService.moveTo(event.from.x, event.from.y, event.to.x, event.to.y);
				ChessBoard.clearBlank();
				ChessBoard.clearAttack();
				ChessBoard.moveChess(event.from.x, event.from.y, event.to.x, event.to.y);
			});

			ChessService.attack(function (event) {
				ChessService.moveTo(event.from.x, event.from.y, event.to.x, event.to.y);
				ChessBoard.clearBlank();
				ChessBoard.clearAttack();
				ChessBoard.attackChess(event.from.x, event.from.y, event.to.x, event.to.y);
			});

			ChessService.error(function (event) {
				alert(event.text);
			});

			ChessService.init(chesses);
			ChessBoard.drawBoard(element);
			ChessBoard.drawChess();
		}
	};
});