thin.define("ChessMan", [], function () {
	function ChessMan(color, type) {
		this.game = null;

		this.color = color;
		this.type = type;
		this.x = -1;
		this.y = -1;

		this.beAttack = false;
	}

	return ChessMan;
});

thin.define("General", ["ChessMan", "ChessType", "ChessColor"], function (ChessMan, ChessType, ChessColor) {
	function General(color) {
		ChessMan.call(this, color, ChessType.GENERAL);
	}

	General.prototype = {
		valid: function (x, y) {
			var result = true;
			switch (this.color) {
				case ChessColor.BLACK:
					if ((x < 3) || (x > 5) || ((y > 2) && (y < 7))) {
						result = false;
					}
					break;
				case ChessColor.RED:
					if ((x < 3) || (x > 5) || ((y > 2) && (y < 7))) {
						result = false;
					}
					break;
				default:
					result = true;
			}
			return result;
		},

		canGo: function (x, y) {
			if (this.valid(x, y) && !this.game.isFriendly(this.color, x, y)) {
				if (Math.abs(this.y - y) + Math.abs(this.x - x) == 1) {
					return true;
				}
				else if (this.x == x) {
					if (this.game.getChess(x, y) && (this.game.getChess(x, y).type == ChessType.GENERAL)) {
						var num = 0;
						var minY = y > this.y ? this.y : y;
						var maxY = y + this.y - minY;

						for (var i=minY+1; i<maxY; i++) {
							if (this.game.getChess(x, i)) {
								num++;
							}
						}

						if (num == 0) {
							return true;
						}
					}
				}
			}
			return false;
		}
	};

	return General;
});

thin.define("Guard", ["ChessMan", "ChessType", "ChessColor"], function (ChessMan, ChessType, ChessColor) {
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
			if (this.valid(x, y) && !this.game.isFriendly(this.color, x, y)) {
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

thin.define("Staff", ["ChessMan", "ChessType", "ChessColor"], function (ChessMan, ChessType, ChessColor) {
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
			if (this.valid(x, y) && !this.game.isFriendly(this.color, x, y)) {
				if ((Math.abs(this.x - x) != 2)
					|| (Math.abs(this.y - y) != 2)) {
					return false;
				}
				else {
					var i = (this.x + x) / 2;
					var j = (this.y + y) / 2;
					if (this.game.isEmpty(i, j)) {
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

thin.define("Horse", ["ChessMan", "ChessType"], function (ChessMan, ChessType) {
	function Horse(color) {
		ChessMan.call(this, color, ChessType.HORSE);
	}

	Horse.prototype = {
		valid: function (x, y) {
			return true;
		},

		canGo: function (x, y) {
			if (this.valid(x, y) && !this.game.isFriendly(this.color, x, y)) {
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

					if (this.game.isEmpty(i, j)) {
						return true;
					}
				}
			}
			return false;
		}
	};

	return Horse;
});

thin.define("Chariot", ["ChessMan", "ChessType"], function (ChessMan, ChessType) {
	function Chariot(color) {
		ChessMan.call(this, color, ChessType.CHARIOT);
	}

	Chariot.prototype = {
		valid: function (x, y) {
			return true;
		},

		canGo: function (x, y) {
			if (this.valid(x, y) && !this.game.isFriendly(this.color, x, y)) {
				if ((this.x != x) && (this.y != y)) {
					return false;
				}
				else {
					if (this.y == y) {
						if (this.x < x) {
							for (var i = this.i + 1; i < x; i++) {
								if (!this.game.isEmpty(i, this.y)) {
									return false;
								}
							}
							return true;
						}

						if (this.x > x) {
							for (var i = this.x - 1; i > x; i--) {
								if (!this.game.isEmpty(i, this.y)) {
									return false;
								}
							}
							return true;
						}
					}
					else {
						if (this.y < y) {
							for (var i = this.y + 1; i < y; i++) {
								if (!this.game.isEmpty(this.x, i)) {
									return false;
								}
							}
							return true;
						}

						if (this.y > y) {
							for (var i = this.y - 1; i > y; i--) {
								if (!this.game.isEmpty(this.x, i)) {
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

thin.define("Cannon", ["ChessMan", "ChessType"], function (ChessMan, ChessType) {
	function Cannon(color) {
		ChessMan.call(this, color, ChessType.CANNON);
	}

	Cannon.prototype = {
		valid: function (x, y) {
			return true;
		},

		canGo: function (x, y) {
			if (this.valid(x, y) && !this.game.isFriendly(this.color, x, y)) {
				if ((this.x != x) && (this.y != y)) {
					return false;
				}
				else {
					if (this.game.isEmpty(x, y)) {
						if (this.y == y) {
							if (this.x < x) {
								for (var i = this.x + 1; i < x; i++) {
									if (!this.game.isEmpty(i, this.y)) {
										return false;
									}
								}
								return true;
							}

							if (this.x > x) {
								for (var i = this.x - 1; i > x; i--) {
									if (!this.game.isEmpty(i, this.y)) {
										return false;
									}
								}
								return true;
							}
						}
						else {
							if (this.y < y) {
								for (var i = this.y + 1; i < y; i++) {
									if (!this.game.isEmpty(this.x, i)) {
										return false;
									}
								}
								return true;
							}

							if (this.y > y) {
								for (var i = this.y - 1; i > y; i--) {
									if (!this.game.isEmpty(this.x, i)) {
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
									if (!this.game.isEmpty(i, this.y)) {
										count++;
									}
								}
								if (count == 1) {
									return true;
								}
							}

							if (this.x > x) {
								for (var i = this.x - 1; i > x; i--) {
									if (!this.game.isEmpty(i, this.y)) {
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
									if (!this.game.isEmpty(this.x, i)) {
										count++;
									}
								}
								if (count == 1) {
									return true;
								}
							}

							if (this.y > y) {
								for (var i = this.y - 1; i > y; i--) {
									if (!this.game.isEmpty(this.x, i)) {
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

thin.define("Soldier", ["ChessMan", "ChessType", "ChessColor"], function (ChessMan, ChessType, ChessColor) {
	function Soldier(color) {
		ChessMan.call(this, color, ChessType.SOLDIER);
	}

	Soldier.prototype = {
		valid: function (x, y) {
			var result = true;
			switch (this.color) {
				case ChessColor.BLACK:
					if ((y < 3)
						|| ((y < 5) && (x % 2 == 1))) {
						result = false;
					}
					break;
				case ChessColor.RED:
					if ((y > 6)
						|| ((y > 4) && (x % 2 == 1))) {
						result = false;
					}
					break;
				default:
					result = true;
			}
			return result;
		},

		canGo: function (x, y) {
			var result = false;
			if (this.valid(x, y) && !this.game.isFriendly(this.color, x, y)) {
				result = true;
				switch (this.color) {
					case ChessColor.BLACK:
						if (y < this.y) {
							result = false;
						}
						else {
							if (Math.abs(x - this.x) + y - this.y != 1) {
								result = false;
							}
						}
						break;
					case ChessColor.RED:
						if (y > this.y) {
							result = false;
						}
						else {
							if (Math.abs(x - this.x) + this.y - y != 1) {
								result = false;
							}
						}
						break;
					default:
						result = true;
				}
			}
			return result;
		}
	};

	return Soldier;
});

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