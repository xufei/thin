thin.define("Chess.Service", ["Observer", "ChessColor", "ChessType", "ChessText", "ChessFactory", "ChessBoard"], function (Observer, Color, Type, Text, Factory, ChessBoard) {
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

	var games = [];

	function Game() {
		this.id = games.length;
		this.situation = [];
		this.currentColor = Color.RED;
		this.currentChess = null;
		this.undoList = [];
		this.redoList = [];
		this.chessUnderAttack = [];

		this.generals = [];
	}

	Game.prototype = {
		init: function (element) {
			var chessBoard = new ChessBoard();
			chessBoard.game = this;
			this.chessBoard = chessBoard;
			chessBoard.drawBoard(element);
			chessBoard.drawChess();

			var game = this;
			chessBoard.on("chessClicked", function (event) {
				game.select(event.chess);
			});

			chessBoard.on("blankClicked", function (event) {
				game.chessBoard.clearBlank();
				game.chessBoard.clearAttack();
				game.chessBoard.moveChess(game.currentChess.x, game.currentChess.y, event.x, event.y);
				game.moveChess(game.currentChess.x, game.currentChess.y, event.x, event.y);
			});

			game.on("click", function (event) {
				var canGo = event.canGo;
				var canKill = event.canKill;

				chessBoard.clearBlank();
				chessBoard.clearAttack();

				for (var i = 0; i < canGo.length; i++) {
					chessBoard.drawBlank(canGo[i].x, canGo[i].y);
				}

				for (var i = 0; i < canKill.length; i++) {
					chessBoard.drawAttack(canKill[i].x, canKill[i].y);
				}
			});
		},

		createChess: function (data) {
			var chess = Factory.createChess(data);
			chess.game = this;
			this.situation[chess.x][chess.y] = chess;

			if (chess.type == Type.GENERAL) {
				this.generals.push(chess);
			}

			return chess;
		},

		isFriendly: function (color, x, y) {
			if (this.isEmpty(x, y))
				return false;

			return color + this.getChess(x, y).color != 0;
		},

		isEmpty: function (x, y) {
			return !this.situation[x][y];
		},

		getChess: function (x, y) {
			return this.situation[x][y];
		},

		select: function (chess) {
			if (this.currentColor == Color.GREY) {
				this.prompt("棋局已终止！");
				return;
			}

			if (this.currentChess) {
				if (this.currentChess.color + chess.color == 0) {
					var canKill = false;
					for (var i = 0; i < this.chessUnderAttack.length; i++) {
						if ((this.chessUnderAttack[i].x == chess.x) && (this.chessUnderAttack[i].y == chess.y)) {
							canKill = true;
							break;
						}
					}

					if (canKill) {
						var step = {
							color: chess.color,
							type: chess.type,
							from: {
								x: this.currentChess.x,
								y: this.currentChess.y
							},
							to: {
								x: chess.x,
								y: chess.y
							},
							enemy: {

							}
						};

						this.undoList.push(step);
						this.chessBoard.clearBlank();
						this.chessBoard.clearAttack();
						this.chessBoard.removeChess(chess.x, chess.y);
						this.chessBoard.moveChess(this.currentChess.x, this.currentChess.y, chess.x, chess.y);
						this.moveChess(this.currentChess.x, this.currentChess.y, chess.x, chess.y);

						if (chess.type == Type.GENERAL) {
							var winner = (chess.color == Color.RED) ? "黑" : "红";
							this.prompt("结束啦，" + winner + "方胜利！");
							this.currentColor = Color.GREY;
						}
						return;
					}
					else {
						this.prompt("吃不到这个棋子！");
						return;
					}
				}
			}
			else {
				if (chess.color != this.currentColor) {
					this.prompt("不该你走！");
					return;
				}
			}

			this.currentChess = chess;
			var whereCanIGo = [];
			this.chessUnderAttack = [];
			for (var i = 0; i < 9; i++) {
				for (var j = 0; j < 10; j++) {
					if (chess.canGo(i, j)) {
						if (this.isEmpty(i, j)) {
							whereCanIGo.push({
								x: i,
								y: j
							});
						}
						else {
							this.chessUnderAttack.push({
								x: i,
								y: j
							});
						}
					}
				}
			}

			this.chessBoard.clearBlank();
			this.chessBoard.clearAttack();

			for (var i = 0; i < whereCanIGo.length; i++) {
				this.chessBoard.drawBlank(whereCanIGo[i].x, whereCanIGo[i].y);
			}

			for (var i = 0; i < this.chessUnderAttack.length; i++) {
				this.chessBoard.drawAttack(this.chessUnderAttack[i].x, this.chessUnderAttack[i].y);
			}
		},

		moveChess: function (oldX, oldY, newX, newY) {
			var step = {
				color: this.currentChess.color,
				type: this.currentChess.type,
				from: {
					x: oldX,
					y: oldY
				},
				to: {
					x: newX,
					y: newY
				}
			};

			this.undoList.push(step);

			var chess = this.situation[oldX][oldY];

			this.situation[oldX][oldY] = null;
			chess.x = newX;
			chess.y = newY;
			this.situation[newX][newY] = chess;

			this.currentColor = Color.RED + Color.BLACK - this.currentColor;
			this.currentChess = null;

			this.log(step);
			this.check();
		},

		check: function() {
			for (var i=0; i<this.generals.length; i++) {
				for (var j=0; j<this.situation.length; j++) {
					for (var k=0; k<this.situation[j].length; k++) {
						if (this.situation[j][k] && this.situation[j][k].canGo(this.generals[i].x, this.generals[i].y)) {
							this.prompt("将军！");
							return;
						}
					}
				}
			}
		},

		prompt: function (text) {
			alert(text);
		},

		log: function (step) {
			var numbers = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
			var directions = ["进", "平", "退"];

			var chessText = Text[step.type + (step.color + 1) * 7 / 2];

			var direction;
			if (step.from.y > step.to.y) {
				direction = -1;
			}
			else if (step.from.y == step.to.y) {
				direction = 0;
			}
			else if (step.from.y < step.to.y) {
				direction = 1;
			}

			var stepLength;
			if (step.from.x == step.to.x) {
				stepLength = Math.abs(step.from.y - step.to.y) - 1;
			}
			else {
				stepLength = step.to.x;
			}

			var text = chessText + numbers[step.from.x] + directions[direction * step.color + 1] + numbers[stepLength];
			console.log(text);
		},

		undo: function () {
			if (this.undoList.length > 0) {
				var step = this.undoList.pop();


				this.redoList.push(step);
			}
		},

		redo: function () {

		}
	}.extend(Observer);

	var Service = {
		createGame: function (data) {
			data = data || chesses;

			var game = new Game();

			for (var i = 0; i < 9; i++) {
				game.situation[i] = [];
			}

			for (var i = 0; i < data.length; i++) {
				game.createChess(data[i]);
			}

			games[game.id] = game;

			return game;
		}
	};

	return Service;
});