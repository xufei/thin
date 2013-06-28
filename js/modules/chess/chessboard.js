

thin.define("ChessBoard", ["Config", "ChessText", "ChessColor", "ChessService"], function (Config, ChessText, ChessColor, ChessService) {
	var offsetX = Config.offsetX;
	var offsetY = Config.offsetY;
	var gridSize = Config.gridSize;

	var blankArr = [];
	var attackArr = [];
	var chesses = [];
	for (var i = 0; i < 9; i++) {
		chesses[i] = [];
	}

	return {
		drawLine: function (x1, y1, x2, y2) {
			this.paper.path("M" + (offsetX + x1 * gridSize) + "," + (offsetY + y1 * gridSize) + " L" + (offsetX + x2 * gridSize) + "," + (offsetY + y2 * gridSize));
		},

		drawStar: function (x, y) {
			var distance = 1 / 10;
			var length = 1 / 4;

			var startX, startY, endX, endY;

			if (x != 0) {
				startX = x - distance;
				startY = y - distance - length;
				endX = x - distance - length;
				endY = y - distance;

				this.drawLine(startX, startY, startX, endY);
				this.drawLine(startX, endY, endX, endY);

				startY = y + distance + length;
				endY = y + distance;

				this.drawLine(startX, startY, startX, endY);
				this.drawLine(startX, endY, endX, endY);
			}

			if (x != 8) {
				startX = x + distance;
				startY = y - distance - length;
				endX = x + distance + length;
				endY = y - distance;

				this.drawLine(startX, startY, startX, endY);
				this.drawLine(startX, endY, endX, endY);

				startY = y + distance + length;
				endY = y + distance;

				this.drawLine(startX, startY, startX, endY);
				this.drawLine(startX, endY, endX, endY);
			}
		},

		drawBoard: function (element) {
			var paper = Raphael(element, 2 * offsetX + 8 * gridSize, 2 * offsetY + 9 * gridSize);

			this.paper = paper;

			var bound = paper.rect(offsetX, offsetY, gridSize * 8, gridSize * 9);
			bound.attr({
				'stroke': 'black',
				'stroke-width': 3
			});

			for (var i = 1; i < 9; i++) {
				this.drawLine(0, i, 8, i);
			}

			for (var i = 1; i < 8; i++) {
				this.drawLine(i, 0, i, 4);
				this.drawLine(i, 5, i, 9);
			}

			for (var i = 0; i < 2; i++) {
				for (var j = 0; j < 2; j++) {
					this.drawLine(3 + 2 * i, 7 * j, 5 - 2 * i, 2 + 7 * j);
				}
			}

			for (var i = 0; i < 2; i++) {
				for (var j = 0; j < 2; j++) {
					this.drawStar(1 + i * 6, 2 + j * 5);
				}
			}

			for (var i = 0; i < 5; i++) {
				for (var j = 0; j < 2; j++) {
					this.drawStar(i * 2, 3 + j * 3);
				}
			}
		},

		drawChess: function (chess) {
			for (var i = 0; i < 9; i++) {
				for (var j = 0; j < 10; j++) {
					var chess = ChessService.getChess(i, j);

					if (chess) {
						var x = offsetX + gridSize * chess.x;
						var y = offsetY + gridSize * chess.y;

						var group = this.paper.set();

						var bound = this.paper.circle(x, y, 0.4 * gridSize);
						bound.attr({
							"stroke-width": 3,
							"fill": "#eeeeee"
						});

						var label = this.paper.text(x, y, ChessText[chess.type + (chess.color + 1) * 7 / 2]);
						var color = chess.color == ChessColor.RED ? "red" : "black";
						label.attr({
							"font-size": 0.6 * gridSize,
							"font-family": "楷体, 宋体, 新宋体",
							"fill": color
						});

						group.push(bound);
						group.push(label);
						group.attr({
							"cursor": "pointer"
						});

						group.click((function (context) {
							return function () {
								ChessService.chessClicked(context);
							};
						})(chess));

						chesses[i][j] = {
							group: group,
							bound: bound,
							label: label
						};
					}
				}
			}
		},

		moveChess: function (oldX, oldY, newX, newY) {
			var x = offsetX + gridSize * newX;
			var y = offsetY + gridSize * newY;

			var chess = chesses[oldX][oldY];
			chess.group.attr({
				cx: x,
				cy: y
			});

			chess.label.attr({
				x: x,
				y: y
			});

			chesses[oldX][oldY] = null;
			chesses[newX][newY] = chess;
		},

		attackChess: function (oldX, oldY, newX, newY) {
			chesses[newX][newY].label.remove();
			chesses[newX][newY].group.remove();

			var x = offsetX + gridSize * newX;
			var y = offsetY + gridSize * newY;

			var chess = chesses[oldX][oldY];
			chess.group.attr({
				cx: x,
				cy: y
			});

			chess.label.attr({
				x: x,
				y: y
			});
			chesses[oldX][oldY] = null;
			chesses[newX][newY] = chess;
		},

		drawBlank: function (x, y) {
			var posX = offsetX + gridSize * x;
			var posY = offsetY + gridSize * y;

			var rect = this.paper.rect(posX - gridSize / 4, posY - gridSize / 4, gridSize / 2, gridSize / 2);
			rect.attr({
				"stroke-width": 2,
				"stroke": "green",
				"fill": "#eeeeee"
			});

			rect.click(function () {
				ChessService.blankClicked(x, y);
			});

			blankArr.push(rect);
		},

		clearBlank: function () {
			for (var i = 0; i < blankArr.length; i++) {
				blankArr[i].remove();
			}
			blankArr = [];
		},

		drawAttack: function (x, y) {
			var posX = offsetX + gridSize * x;
			var posY = offsetY + gridSize * y;

			var rect = this.paper.rect(posX - gridSize * 0.45, posY - gridSize * 0.45, gridSize * 0.9, gridSize * 0.9);
			rect.attr({
				"stroke-width": 2,
				"stroke": "green"
			});

			rect.click(function () {
				ChessService.blankClicked(x, y);
			});

			attackArr.push(rect);
		},

		clearAttack: function () {
			for (var i = 0; i < attackArr.length; i++) {
				attackArr[i].remove();
			}
			attackArr = [];
		},

		clearAll: function() {
			for (var i=0; i<chesses.length; i++) {
				for (var j=0; j<chesses[i].length; j++) {
					chesses[i][j].label.remove();
					chesses[i][j].group.remove();
				}
			}
		}
	};
});