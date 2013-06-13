thin.module("ChessType", [], function() {
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

thin.module("ChessColor", [], function() {
	return {
		RED: 2,
		BLACK: 1,
		GREY: 0
	}
});

thin.value("offsetX", 20)
	.value("offsetY", 20)
	.value("gridSize", 60);

angular.module("chess")
	.directive("chessboard", function (offsetX, offsetY, gridSize) {
		return function (scope, element, attrs) {
			drawBoard();

			function drawBoard() {
				var paper = Raphael(element[0], 1024, 1024);

				scope.paper = paper;

				var bound = paper.rect(offsetX, offsetY, gridSize * 8, gridSize * 9);
				bound.attr({
					'stroke': 'black',
					'stroke-width': 3
				});

				for (var i = 1; i < 9; i++) {
					drawLine(0, i, 8, i);
				}

				for (var i = 1; i < 8; i++) {
					drawLine(i, 0, i, 4);
					drawLine(i, 5, i, 9);
				}

				for (var i = 0; i < 2; i++) {
					for (var j = 0; j < 2; j++) {
						drawLine(3 + 2 * i, 7 * j, 5 - 2 * i, 2 + 7 * j);
					}
				}

				for (var i = 0; i < 2; i++) {
					for (var j = 0; j < 2; j++) {
						drawStar(1 + i * 6, 2 + j * 5);
					}
				}

				for (var i = 0; i < 5; i++) {
					for (var j = 0; j < 2; j++) {
						drawStar(i * 2, 3 + j * 3);
					}
				}

				function drawLine(x1, y1, x2, y2) {
					paper.path("M" + (offsetX + x1 * gridSize) + "," + (offsetY + y1 * gridSize) + " L" + (offsetX + x2 * gridSize) + "," + (offsetY + y2 * gridSize));
				}

				function drawStar(x, y) {
					var distance = 1 / 10;
					var length = 1 / 4;

					var startX, startY, endX, endY;

					if (x != 0) {
						startX = x - distance;
						startY = y - distance - length;
						endX = x - distance - length;
						endY = y - distance;

						drawLine(startX, startY, startX, endY);
						drawLine(startX, endY, endX, endY);

						startY = y + distance + length;
						endY = y + distance;

						drawLine(startX, startY, startX, endY);
						drawLine(startX, endY, endX, endY);
					}

					if (x != 8) {
						startX = x + distance;
						startY = y - distance - length;
						endX = x + distance + length;
						endY = y - distance;

						drawLine(startX, startY, startX, endY);
						drawLine(startX, endY, endX, endY);

						startY = y + distance + length;
						endY = y + distance;

						drawLine(startX, startY, startX, endY);
						drawLine(startX, endY, endX, endY);
					}
				};
			};

			drawBoard();
		};
	})
	.directive("chess", function (gridSize) {
		return function (scope, element, attrs, rootScope) {
			var type = scope.$eval(attrs.type);
			var color = scope.$eval(attr.color);

		};
	});

thin.module("ChessService", [], function (ChessType, ChessColor, ChessMan) {

	this.init = function (data) {
	};

	this.createChess = function(type, color) {
		return new ChessMan(type, color);
	};

	this.isFriendly = function (x, y) {
		alert(ChessType.BLACK);

	};

	this.isEmpty = function (x, y) {

	};

	this.getChess = function (x, y) {

	};
});

thin.module("ChessMan", [], function () {
	function ChessMan(type, color) {
		this.color = color;
		this.type = type;

		this.beAttack = false;

		this.element = angular.element("<div chess type='" + this.type + "' color='" + this.color + "'></div>");
	}

	return ChessMan;
});

angular.module("General", ["ChessService", "ChessMan", "ChessType", "ChessColor"],
	function (chessService, ChessMan, ChessType, ChessColor) {
	function General(color) {
		ChessMan.call(this, ChessType.GENERAL, color);
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
});

angular.module("chess").factory("Guard", function (chessService, ChessMan, ChessType, ChessColor) {
	function Guard(color) {
		ChessMan.call(this, ChessType.GUARD, color);
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
});

angular.module("chess").factory("Staff", function (chessService, ChessMan, ChessType, ChessColor) {
	function Staff(color) {
		ChessMan.call(this, ChessType.STAFF, color);
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
});

angular.module("chess").factory("Horse", function (chessService, ChessMan, ChessType, ChessColor) {
	function Horse(color) {
		ChessMan.call(this, ChessType.HORSE, color);
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
});

angular.module("chess").factory("Chariot", function (chessService, ChessMan, ChessType, ChessColor) {
	function Chariot(color) {
		ChessMan.call(this, ChessType.CHARIOT, color);
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
							for (var x = this.x + 1; x < x; x++) {
								if (!chessService.isEmpty(x, this.y)) {
									return false;
								}
							}
							return true;
						}

						if (this.x > x) {
							for (var x = this.x - 1; x > x; x--) {
								if (!chessService.isEmpty(x, this.y)) {
									return false;
								}
							}
							return true;
						}
					}
					else {
						if (this.y < y) {
							for (var y = this.y + 1; y < y; y++) {
								if (!chessService.isEmpty(this.x, y)) {
									return false;
								}
							}
							return true;
						}

						if (this.y > y) {
							for (var y = this.y - 1; y > y; y--) {
								if (!chessService.isEmpty(this.x, y)) {
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
});

angular.module("chess").factory("Cannon", function (chessService, ChessMan, ChessType, ChessColor) {
	function Cannon(color) {
		ChessMan.call(this, ChessType.CANNON, color);
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
								for (var x = this.x + 1; x < x; x++) {
									if (!chessService.isEmpty(x, this.y)) {
										return false;
									}
								}
								return true;
							}

							if (this.x > x) {
								for (var x = this.x - 1; x > x; x--) {
									if (!chessService.isEmpty(x, this.y)) {
										return false;
									}
								}
								return true;
							}
						}
						else {
							if (this.y < y) {
								for (var y = this.y + 1; y < y; y++) {
									if (!chessService.isEmpty(this.x, y)) {
										return false;
									}
								}
								return true;
							}

							if (this.y > y) {
								for (var y = this.y - 1; y > y; y--) {
									if (!chessService.isEmpty(this.x, y)) {
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
								for (var x = this.x + 1; x < x; x++) {
									if (!chessService.isEmpty(x, this.y)) {
										count++;
									}
								}
								if (count == 1) {
									return true;
								}
							}

							if (this.x > x) {
								for (var x = this.x - 1; x > x; x--) {
									if (!chessService.isEmpty(x, this.y)) {
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
								for (var y = this.y + 1; y < y; y++) {
									if (!chessService.isEmpty(this.x, y)) {
										count++;
									}
								}
								if (count == 1) {
									return true;
								}
							}

							if (this.y > y) {
								for (var y = this.y - 1; y > y; y--) {
									if (!chessService.isEmpty(this.x, y)) {
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
});

angular.module("chess").factory("Soldier", function (chessService, ChessMan, ChessType, ChessColor) {
	function Soldier(color) {
		ChessMan.call(this, ChessType.SOLDIER, color);
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
});

angular.module("chess").factory("Blank", function () {


});


angular.module("chess").controller("ChessCtrl", function ($scope, $element, $compile, chessService) {
	//color, type, x, y
	var chesses = [
		[2, 7, 4, 8],
		[2, 6, 3, 8],
		[2, 6, 5, 8],
		[2, 5, 2, 8],
		[2, 5, 6, 8],
		[2, 4, 1, 8],
		[2, 4, 7, 8],
		[2, 3, 0, 8],
		[2, 3, 8, 8],
		[2, 2, 1, 6],
		[2, 2, 7, 6],
		[2, 1, 0, 5],
		[2, 1, 2, 5],
		[2, 1, 4, 5],
		[2, 1, 6, 5],
		[2, 1, 8, 5],

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

	$scope.init = function () {
		chessService.init();

		var chess = chessService.createChess(7, 2);
		var dom = $compile(chess.element)($scope);
		angular.element($element).append(dom);
	};

	$scope.test = function () {
		chessService.getChess(1, 1);
	}
});