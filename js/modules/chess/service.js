thin.define("Chess.Service", ["ChessFactory"], function(factory) {
	var gameList = [];

	function Game() {
		this.situation = [];
		this.currentColor = ChessColor.RED;
		this.undoList = [];
		this.redoList = [];
		this.chessUnderAttack = [];
	}

	Game.prototype = {
		createChess: function() {
			var chess = factory.createChess(data);
			this.situation[chess.x][chess.y] = chess;

			return chess;
		}
	};

	var Service = {
		createGame: function(data) {
			var game = new Game();

			for (var i = 0; i < 9; i++) {
				game.situation[i] = [];
			}

			for (var i = 0; i < data.length; i++) {
				game.createChess(data[i]);
			}


		}
	};
});

thin.define("ChessService", ["ChessType", "ChessColor"], function (ChessType, ChessColor) {
	var situation;
	var observer = {};
	var currentChess;
	var currentColor = ChessColor.RED;

	var chessUnderAttack = [];

	var undoList = [];
	var redoList = [];

	var service = {
		init: function (data) {
			situation = [];
			for (var i = 0; i < 9; i++) {
				situation[i] = [];
			}

			for (var i = 0; i < data.length; i++) {
				this.create(data[i]);
			}

			currentColor = ChessColor.RED;
			undoList = [];
			redoList = [];
		},

		create: function(data) {
			var chess = this.factory.createChess(data);
			situation[chess.x][chess.y] = chess;

			return chess;
		},

		click: function (handler) {
			observer["click"] = handler;
		},

		move: function (handler) {
			observer["move"] = handler;
		},

		attack: function (handler) {
			observer["attack"] = handler;
		},

		error: function (handler) {
			observer["error"] = handler;
		},

		dispatch: function (event) {
			if (observer[event.type]) {
				observer[event.type](event);
			}
		},

		chessClicked: function (chess) {
			if (currentColor == ChessColor.GREY) {
				var event = {
					type: "error",
					text: "棋局已终止！"
				};
				this.dispatch(event);
				return;
			}

			if (currentChess) {
				if (currentChess.color + chess.color == 0) {
					var canKill = false;
					for (var i = 0; i < chessUnderAttack.length; i++) {
						if ((chessUnderAttack[i].x == chess.x) && (chessUnderAttack[i].y == chess.y)) {
							canKill = true;
							break;
						}
					}

					if (canKill) {
						var event = {
							type: "attack",
							from: {
								x: currentChess.x,
								y: currentChess.y
							},
							to: {
								x: chess.x,
								y: chess.y
							}
						};
						this.dispatch(event);

						var step = {
							color: chess.color,
							type: chess.type,
							from: {
								x: currentChess.x,
								y: currentChess.y
							},
							to: {
								x: chess.x,
								y: chess.y
							},
							enemy: {

							}
						};

						undoList.push(step);

						if (chess.type == ChessType.GENERAL) {
							var winColor = (chess.color == ChessColor.RED) ? "黑" : "红";
							var event = {
								type: "error",
								text: "结束啦，" + winColor + "方胜利！"
							};
							this.dispatch(event);
							currentColor = ChessColor.GREY;
						}
						return;
					}
					else {
						var event = {
							type: "error",
							text: "吃不到这个棋子！"
						};
						this.dispatch(event);
						return;
					}
				}
			}
			else {
				if (chess.color != currentColor) {
					var event = {
						type: "error",
						text: "不该你走！"
					};
					this.dispatch(event);
					return;
				}
			}

			currentChess = chess;
			var whereCanIGo = [];
			chessUnderAttack = [];
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
							chessUnderAttack.push({
								x: i,
								y: j
							});
						}
					}
				}
			}

			var event = {
				type: "click",
				canGo: whereCanIGo,
				canKill: chessUnderAttack
			};
			this.dispatch(event);
		},

		blankClicked: function (x, y) {
			var event = {
				type: "move",
				from: {
					x: currentChess.x,
					y: currentChess.y
				},
				to: {
					x: x,
					y: y
				}
			};
			this.dispatch(event);

			var step = {
				color: currentChess.color,
				type: currentChess.type,
				from: {
					x: currentChess.x,
					y: currentChess.y
				},
				to: {
					x: x,
					y: y
				}
			};

			undoList.push(step);
		},

		isFriendly: function (color, x, y) {
			if (this.isEmpty(x, y))
				return false;

			return color + this.getChess(x, y).color != 0;
		},

		isEmpty: function (x, y) {
			return !situation[x][y];
		},

		getChess: function (x, y) {
			return situation[x][y];
		},

		moveTo: function (oldX, oldY, newX, newY) {
			var chess = situation[oldX][oldY];

			situation[oldX][oldY] = null;
			chess.x = newX;
			chess.y = newY;
			situation[newX][newY] = chess;

			currentColor = ChessColor.RED + ChessColor.BLACK - currentColor;
			currentChess = null;
		},

		undo: function() {
			if (undoList.length > 0) {
				var step = undoList.pop();

				var event = {
					type: "move",
					from: {
						x: currentChess.x,
						y: currentChess.y
					},
					to: {
						x: x,
						y: y
					}
				};
				this.dispatch(event);
			}
		}
	};

	return service;
});