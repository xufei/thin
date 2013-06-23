thin.define("ChessType", [], function () {
	return {
		GENERAL: 7,
		GUARD: 6,
		STAFF: 5,
		HORSE: 4,
		CHARIOT: 3,
		CANNON: 2,
		SOLDIER: 1,
		BLANK: 0
	};
});

thin.define("ChessText", [], function() {
	return {
		14: "帅",
		13: "仕",
		12: "相",
		11: "马",
		10: "车",
		9: "炮",
		8: "兵",
		7: "将",
		6: "士",
		5: "象",
		4: "马",
		3: "车",
		2: "炮",
		1: "卒"
	};
});

thin.define("ChessColor", [], function () {
	return {
		RED: 2,
		BLACK: 1,
		GREY: 0
	}
});

thin.define("Config", [], function () {
	return {
		offsetX: 40,
		offsetY: 40,
		gridSize: 60
	};
});

thin.define("ChessBoard", ["Config", "ChessText", "ChessColor", "ChessService"], function (Config, ChessText, ChessColor, ChessService) {
	var offsetX = Config.offsetX;
	var offsetY = Config.offsetY;
	var gridSize = Config.gridSize;

	var blank = [];
	var chesses = [];
	for (var i=0; i<9; i++) {
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

		drawChess: function(chess) {
			for (var i=0; i<9; i++) {
				for (var j=0; j<10; j++) {
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
						
						var label = this.paper.text(x, y, ChessText[chess.type + (chess.color - 1) * 7]);
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

						group.click((function(context) {
							return function() {
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

		moveChess: function(oldX, oldY, newX, newY) {
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

		drawBlank: function(x, y) {
			var posX = offsetX + gridSize * x;
			var posY = offsetY + gridSize * y;

			var rect = this.paper.rect(posX- gridSize / 4, posY - gridSize / 4, gridSize / 2, gridSize / 2);
			rect.attr({
				"stroke-width": 2,
				"stroke": "green",
				"fill": "#eeeeee"
			});

			rect.click(function() {
				ChessService.blankClicked(x, y);
			});

			blank.push(rect);
		},

		clearBlank: function() {
			for (var i=0; i<blank.length; i++) {
				blank[i].remove();
			}
			blank = [];
		}
	};
});

thin.define("ChessService", ["ChessType", "ChessColor"], function (ChessType, ChessColor) {
	var situation;
	var observer = {};
	var currentChess;

	var service = {
		init: function (data) {
			situation = [];
			for (var i=0; i<9; i++) {
				situation[i] = [];
			}

			for (var i=0; i<data.length; i++) {
				var chess = this.factory.createChess(data[i]);

				situation[chess.x][chess.y] = chess;
			}
		},

		click: function(handler) {
			observer["click"] = handler;
		},

		move: function(handler) {
			observer["move"] = handler;
		},

		attack: function(handler) {
			observer["attack"] = handler;
		},

		chessClicked: function(chess) {
			currentChess = chess;
			var whereCanIGo = [];
			for (var i=0; i<9; i++) {
				for (var j=0; j<10; j++) {
					if (chess.canGo(i, j)) {
						whereCanIGo.push({
							x: i,
							y: j
						});	
					}
				}
			}

			if (observer["click"]) {
				observer["click"](whereCanIGo);
			}
		},

		blankClicked: function(x, y) {
			if (observer["move"]) {
				observer["move"](currentChess, x, y);
			}
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

		moveTo: function(chess, x, y) {
			situation[chess.x][chess.y] = null;
			chess.x = x;
			chess.y = y;
			situation[x][y] = chess;
		}
	};

	return service;
});

thin.define("ChessMan", [], function () {
	function ChessMan(color, type) {
		this.color = color;
		this.type = type;
		this.x = -1;
		this.y = -1;

		this.beAttack = false;
	}

	return ChessMan;
});

thin.define("General", ["ChessService", "ChessMan", "ChessType", "ChessColor"], function (chessService, ChessMan, ChessType, ChessColor) {
	function General(color) {
		ChessMan.call(this, color, ChessType.GENERAL);
	}

	General.prototype = {
		valid: function (x, y) {
			switch (this.color) {
				case ChessColor.BLACK:
					if ((x < 3) || (x > 5) || (y > 2)) {
						return false;
					}
					break;
				case ChessColor.RED:
					if ((x < 3) || (x > 5) || (y < 7)) {
						return false;
					}
					break;
				default:
					return true;
			}
		},

		canGo: function (x, y) {
			if (this.valid(x, y) && !chessService.isFriendly(this.color, x, y)) {
				if (Math.abs(this.y - y) + Math.abs(this.x - x) != 1) {
					return false;
				}
				else {
					return true;
				}
			}
			return false;
		}
	};

	return General;
});

thin.define("Guard", ["ChessService", "ChessMan", "ChessType", "ChessColor"], function (chessService, ChessMan, ChessType, ChessColor) {
	function Guard(color) {
		ChessMan.call(this, color, ChessType.GUARD);
	}

	Guard.prototype = {
		valid: function (x, y) {
			switch (this.color) {
				case ChessColor.BLACK:
					if (((x == 3) && (y == 0))
						|| ((x == 3) && (y == 2))
						|| ((x == 5) && (y == 0))
						|| ((x == 5) && (y == 2))
						|| ((x == 4) && (y == 1))) {
						return true;
					}
					break;
				case ChessColor.RED:
					if (((x == 3) && (y == 7))
						|| ((x == 3) && (y == 9))
						|| ((x == 5) && (y == 7))
						|| ((x == 5) && (y == 9))
						|| ((x == 4) && (y == 8))) {
						return true;
					}
					break;
				default:
					return false;
			}
		},

		canGo: function (x, y) {
			if (this.valid(x, y) && !chessService.isFriendly(this.color, x, y)) {
				if ((Math.abs(this.x - x) > 1)
					|| (Math.abs(this.y - y) > 1)
					|| ((Math.abs(this.x - x) == 0)
					&& (Math.abs(this.y - y) == 0))) {
					return false;
				}
				else {
					return true;
				}
			}
			return false;
		}
	};

	return Guard;
});

thin.define("Staff", ["ChessService", "ChessMan", "ChessType", "ChessColor"], function (chessService, ChessMan, ChessType, ChessColor) {
	function Staff(color) {
		ChessMan.call(this, color, ChessType.STAFF);
	}

	Staff.prototype = {
		valid: function (x, y) {
			switch (this.color) {
				case ChessColor.BLACK:
					if (((x == 0) && (y == 2))
						|| ((x == 2) && (y == 0))
						|| ((x == 2) && (y == 4))
						|| ((x == 4) && (y == 2))
						|| ((x == 6) && (y == 0))
						|| ((x == 6) && (y == 4))
						|| ((x == 8) && (y == 2))) {
						return true;
					}
					break;
				case ChessColor.RED:
					if (((x == 0) && (y == 7))
						|| ((x == 2) && (y == 5))
						|| ((x == 2) && (y == 9))
						|| ((x == 4) && (y == 7))
						|| ((x == 6) && (y == 5))
						|| ((x == 6) && (y == 9))
						|| ((x == 8) && (y == 7))) {
						return true;
					}
					break;
				default:
					return false;
			}
		},

		canGo: function (x, y) {
			if (this.valid(x, y) && !chessService.isFriendly(this.color, x, y)) {
				if ((Math.abs(this.x - x) != 2)
					|| (Math.abs(this.y - y) != 2)) {
					return false;
				}
				else {
					var i = (this.x + x) / 2;
					var j = (this.y + y) / 2;
					if (chessService.isEmpty(i, j)) {
						return true;
					}
					else {
						return false;
					}
				}
			}
			return false;
		}
	};

	return Staff;
});

thin.define("Horse", ["ChessService", "ChessMan", "ChessType"], function (chessService, ChessMan, ChessType) {
	function Horse(color) {
		ChessMan.call(this, color, ChessType.HORSE);
	}

	Horse.prototype = {
		valid: function (x, y) {
			return true;
		},

		canGo: function (x, y) {
			if (this.valid(x, y) && !chessService.isFriendly(this.color, x, y)) {
				if (((Math.abs(this.x - x) == 1)
					&& (Math.abs(this.y - y) == 2))
					|| ((Math.abs(this.x - x) == 2)
					&& (Math.abs(this.y - y) == 1))) {
					var i = -1;
					var j = -1;
					if (x - this.x == 2) {
						i = this.x + 1;
						j = this.y;
					}
					else if (this.x - x == 2) {
						i = this.x - 1;
						j = this.y;
					}
					else if (y - this.y == 2) {
						i = this.x;
						j = this.y + 1;
					}
					else if (this.y - y == 2) {
						i = this.x;
						j = this.y - 1;
					}

					if (chessService.isEmpty(i, j)) {
						return true;
					}
				}
			}
			return false;
		}
	};

	return Horse;
});

thin.define("Chariot", ["ChessService", "ChessMan", "ChessType"], function (chessService, ChessMan, ChessType) {
	function Chariot(color) {
		ChessMan.call(this, color, ChessType.CHARIOT);
	}

	Chariot.prototype = {
		valid: function (x, y) {
			return true;
		},

		canGo: function (x, y) {
			if (this.valid(x, y) && !chessService.isFriendly(this.color, x, y)) {
				if ((this.x != x) && (this.y != y)) {
					return false;
				}
				else {
					if (this.y == y) {
						if (this.x < x) {
							for (var i= this.i + 1; i < x; i++) {
								if (!chessService.isEmpty(i, this.y)) {
									return false;
								}
							}
							return true;
						}

						if (this.x > x) {
							for (var i = this.x - 1; i > x; i--) {
								if (!chessService.isEmpty(i, this.y)) {
									return false;
								}
							}
							return true;
						}
					}
					else {
						if (this.y < y) {
							for (var i = this.y + 1; i < y; i++) {
								if (!chessService.isEmpty(this.x, i)) {
									return false;
								}
							}
							return true;
						}

						if (this.y > y) {
							for (var i = this.y - 1; i > y; i--) {
								if (!chessService.isEmpty(this.x, i)) {
									return false;
								}
							}
							return true;
						}
					}
				}
			}
			return false;
		}
	};

	return Chariot;
});

thin.define("Cannon", ["ChessService", "ChessMan", "ChessType"], function (chessService, ChessMan, ChessType) {
	function Cannon(color) {
		ChessMan.call(this, color, ChessType.CANNON);
	}

	Cannon.prototype = {
		valid: function (x, y) {
			return true;
		},

		canGo: function (x, y) {
			if (this.valid(x, y) && !chessService.isFriendly(this.color, x, y)) {
				if ((this.x != x) && (this.y != y)) {
					return false;
				}
				else {
					if (chessService.isEmpty(x, y)) {
						if (this.y == y) {
							if (this.x < x) {
								for (var i = this.x + 1; i < x; i++) {
									if (!chessService.isEmpty(i, this.y)) {
										return false;
									}
								}
								return true;
							}

							if (this.x > x) {
								for (var i = this.x - 1; i > x; i--) {
									if (!chessService.isEmpty(i, this.y)) {
										return false;
									}
								}
								return true;
							}
						}
						else {
							if (this.y < y) {
								for (var i = this.y + 1; i < y; i++) {
									if (!chessService.isEmpty(this.x, i)) {
										return false;
									}
								}
								return true;
							}

							if (this.y > y) {
								for (var i = this.y - 1; i > y; i--) {
									if (!chessService.isEmpty(this.x, i)) {
										return false;
									}
								}
								return true;
							}
						}
					}
					else {
						var count = 0;

						if (this.y == y) {
							if (this.x < x) {
								for (var i = this.x + 1; i < x; i++) {
									if (!chessService.isEmpty(i, this.y)) {
										count++;
									}
								}
								if (count == 1) {
									return true;
								}
							}

							if (this.x > x) {
								for (var i = this.x - 1; i > x; i--) {
									if (!chessService.isEmpty(i, this.y)) {
										count++;
									}
								}
								if (count == 1) {
									return true;
								}
							}
						}
						else {
							if (this.y < y) {
								for (var i = this.y + 1; i < y; i++) {
									if (!chessService.isEmpty(this.x, i)) {
										count++;
									}
								}
								if (count == 1) {
									return true;
								}
							}

							if (this.y > y) {
								for (var i = this.y - 1; i > y; i--) {
									if (!chessService.isEmpty(this.x, i)) {
										count++;
									}
								}
								if (count == 1) {
									return true;
								}
							}
						}
					}
				}
			}
			return false;
		}
	};

	return Cannon;
});

thin.define("Soldier", ["ChessService", "ChessMan", "ChessType", "ChessColor"], function (chessService, ChessMan, ChessType, ChessColor) {
	function Soldier(color) {
		ChessMan.call(this, color, ChessType.SOLDIER);
	}

	Soldier.prototype = {
		valid: function (x, y) {
			switch (this.color) {
				case ChessColor.BLACK:
					if ((y < 3)
						|| ((y < 5) && (x % 2 == 1))) {
						return false;
					}
					break;
				case ChessColor.RED:
					if ((y > 6)
						|| ((y > 4) && (x % 2 == 1))) {
						return false;
					}
					break;
				default:
					return true;
			}
		},

		canGo: function (x, y) {
			if (this.valid(x, y) && !chessService.isFriendly(this.color, x, y)) {
				switch (this.color) {
					case ChessColor.BLACK:
						if (y < this.y) {
							return false;
						}
						else {
							if (Math.abs(x - this.x) + y - this.y != 1) {
								return false;
							}
						}
						break;
					case ChessColor.RED:
						if (y > this.y) {
							return false;
						}
						else {
							if (Math.abs(x - this.x) + this.y - y != 1) {
								return false;
							}
						}
						break;
					default:
						return true;
				}
			}
			return false;
		}
	};

	return Soldier;
});

thin.define("Blank", [], function () {


});

thin.define("ChessFactory", ["ChessType", "ChessColor", "General", "Guard", "Staff", "Horse", "Chariot", "Cannon", "Soldier"], function(ChessType, ChessColor, General) {
	var ChessConstructors = [].slice.call(arguments).slice(2);

	var ChessFactory = {
		createChess: function(data) {
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

thin.define("ChessController", ["ChessBoard", "ChessFactory", "ChessService"], function (ChessBoard, ChessFactory, ChessService) {
	//color, type, x, y
	var chesses = [
		[2, 7, 4, 9],
		[2, 6, 3, 9],
		[2, 6, 5, 9],
		[2, 5, 2, 9],
		[2, 5, 6, 9],
		[2, 4, 1, 9],
		[2, 4, 7, 9],
		[2, 3, 0, 9],
		[2, 3, 8, 9],
		[2, 2, 1, 7],
		[2, 2, 7, 7],
		[2, 1, 0, 6],
		[2, 1, 2, 6],
		[2, 1, 4, 6],
		[2, 1, 6, 6],
		[2, 1, 8, 6],

		[1, 7, 4, 0],
		[1, 6, 3, 0],
		[1, 6, 5, 0],
		[1, 5, 2, 0],
		[1, 5, 6, 0],
		[1, 4, 1, 0],
		[1, 4, 7, 0],
		[1, 3, 0, 0],
		[1, 3, 8, 0],
		[1, 2, 1, 2],
		[1, 2, 7, 2],
		[1, 1, 0, 3],
		[1, 1, 2, 3],
		[1, 1, 4, 3],
		[1, 1, 6, 3],
		[1, 1, 8, 3]
	];

	return {
		init: function (element) {
			ChessService.factory = ChessFactory;
			ChessService.init(chesses);

			ChessService.click(function(arr) {
				ChessBoard.clearBlank();

				for (var i=0; i<arr.length; i++) {
					ChessBoard.drawBlank(arr[i].x, arr[i].y);
				}
			});

			ChessService.move(function(chess, x, y) {
				var oldX = chess.x;
				var oldY = chess.y;

				ChessService.moveTo(chess, x, y);
				ChessBoard.clearBlank();
				ChessBoard.moveChess(oldX, oldY, x, y);
			});

			ChessService.attack(function(chess, x, y) {
				ChessBoard.attack(chess, x, y);
			});

			ChessBoard.drawBoard(element);
			ChessBoard.drawChess();
		}
	};
});