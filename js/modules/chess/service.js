thin.define("Chess.Service", ["Observer", "ChessColor", "ChessType", "ChessFactory"], function(Observer, Color, Type, Factory) {
	var games = [];

	function Game() {
        this.id = games.length;
		this.situation = [];
		this.currentColor = Color.RED;
		this.undoList = [];
		this.redoList = [];
		this.chessUnderAttack = [];
	}

	Game.prototype = {
		createChess: function(data) {
			var chess = Factory.createChess(data);
            chess.game = this;
			this.situation[chess.x][chess.y] = chess;

			return chess;
		},

        click: function (handler) {
            this.on("click", handler);
        },

        move: function (handler) {
            this.on("move", handler);
        },

        attack: function (handler) {
            this.on("attack", handler);
        },

        error: function (handler) {
            this.on("error", handler);
        },

        chessClicked: function (chess) {
            if (this.currentColor == Color.GREY) {
                var event = {
                    type: "error",
                    text: "棋局已终止！"
                };
                this.fire(event);
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
                        var event = {
                            type: "attack",
                            from: {
                                x: this.currentChess.x,
                                y: this.currentChess.y
                            },
                            to: {
                                x: chess.x,
                                y: chess.y
                            }
                        };
                        this.fire(event);

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

                        if (chess.type == Type.GENERAL) {
                            var winColor = (chess.color == Color.RED) ? "黑" : "红";
                            var event = {
                                type: "error",
                                text: "结束啦，" + winColor + "方胜利！"
                            };
                            this.fire(event);
                            this.currentColor = Color.GREY;
                        }
                        return;
                    }
                    else {
                        var event = {
                            type: "error",
                            text: "吃不到这个棋子！"
                        };
                        this.fire(event);
                        return;
                    }
                }
            }
            else {
                if (chess.color != this.currentColor) {
                    var event = {
                        type: "error",
                        text: "不该你走！"
                    };
                    this.fire(event);
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

            var event = {
                type: "click",
                canGo: whereCanIGo,
                canKill: this.chessUnderAttack
            };
            this.fire(event);
        },

        blankClicked: function (x, y) {
            var event = {
                type: "move",
                from: {
                    x: this.currentChess.x,
                    y: this.currentChess.y
                },
                to: {
                    x: x,
                    y: y
                }
            };
            this.fire(event);

            var step = {
                color: this.currentChess.color,
                type: this.currentChess.type,
                from: {
                    x: this.currentChess.x,
                    y: this.currentChess.y
                },
                to: {
                    x: x,
                    y: y
                }
            };

            this.undoList.push(step);
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

        moveTo: function (oldX, oldY, newX, newY) {
            var chess = this.situation[oldX][oldY];

            this.situation[oldX][oldY] = null;
            chess.x = newX;
            chess.y = newY;
            this.situation[newX][newY] = chess;

            this.currentColor = Color.RED + Color.BLACK - this.currentColor;
            this. currentChess = null;
        },

        undo: function() {
            if (this.undoList.length > 0) {
                var step = this.undoList.pop();

                var event = {
                    type: "move",
                    from: {
                        x: this.currentChess.x,
                        y: this.currentChess.y
                    },
                    to: {
                        x: x,
                        y: y
                    }
                };
                this.fire(event);
            }
        }
    }.extend(Observer);

    var Service = {
        createGame: function(data) {
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

		fire: function (event) {
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
				this.fire(event);
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
						this.fire(event);

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
							this.fire(event);
							currentColor = ChessColor.GREY;
						}
						return;
					}
					else {
						var event = {
							type: "error",
							text: "吃不到这个棋子！"
						};
						this.fire(event);
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
					this.fire(event);
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
			this.fire(event);
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
			this.fire(event);

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
				this.fire(event);
			}
		}
	};

	return service;
});