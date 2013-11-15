thin.define("ChessBoard", ["_", "Events", "Config", "ChessText", "ChessColor"], function (_, Events, Config, ChessText, ChessColor) {
	var offsetX = Config.offsetX;
	var offsetY = Config.offsetY;
	var gridSize = Config.gridSize;

	var ChessBoard = function () {
		this.game = null;

		this.blankArr = [];
		this.attackArr = [];
		this.chesses = [];

		for (var i = 0; i < 9; i++) {
			this.chesses[i] = [];
		}
	};

	ChessBoard.prototype = _.extend({
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

				var that = this;
				group.click((function (context) {
					return function () {
						var evt = {
							type: "chessClicked",
							chess: context
						};
						that.fire(evt);
					};
				})(chess));

				this.chesses[chess.x][chess.y] = {
					group: group,
					bound: bound,
					label: label
				};
			}

		},

		drawAllChess: function () {
			for (var i = 0; i < 9; i++) {
				for (var j = 0; j < 10; j++) {
					this.drawChess(this.game.getChess(i, j));
				}
			}
		},

		moveChess: function (oldX, oldY, newX, newY) {
			var x = offsetX + gridSize * newX;
			var y = offsetY + gridSize * newY;

			var chess = this.chesses[oldX][oldY];
			chess.group.attr({
				cx: x,
				cy: y
			});

			chess.label.attr({
				x: x,
				y: y
			});

			this.chesses[oldX][oldY] = null;
			this.chesses[newX][newY] = chess;
		},

		removeChess: function (x, y) {
			this.chesses[x][y].label.remove();
			this.chesses[x][y].group.remove();

			this.chesses[x][y] = null;
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

			var that = this;
			rect.click(function () {
				var event = {
					type: "blankClicked",
					x: x,
					y: y
				};
				that.fire(event);
			});

			this.blankArr.push(rect);
		},

		clearBlank: function () {
			for (var i = 0; i < this.blankArr.length; i++) {
				this.blankArr[i].remove();
			}
			this.blankArr = [];
		},

		drawAttack: function (x, y) {
			var posX = offsetX + gridSize * x;
			var posY = offsetY + gridSize * y;

			var rect = this.paper.rect(posX - gridSize * 0.45, posY - gridSize * 0.45, gridSize * 0.9, gridSize * 0.9);
			rect.attr({
				"stroke-width": 2,
				"stroke": "green"
			});

			this.attackArr.push(rect);
		},

		clearAttack: function () {
			for (var i = 0; i < this.attackArr.length; i++) {
				this.attackArr[i].remove();
			}
			this.attackArr = [];
		},

		clearAll: function () {
			for (var i = 0; i < this.chesses.length; i++) {
				for (var j = 0; j < this.chesses[i].length; j++) {
					this.chesses[i][j].label.remove();
					this.chesses[i][j].group.remove();
				}
			}
		}
	}, Events);

	return ChessBoard;
});