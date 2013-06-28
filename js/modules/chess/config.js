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

thin.define("ChessText", [], function () {
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
		RED: 1,
		BLACK: -1,
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