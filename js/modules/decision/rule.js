thin.define("Rule", [], function () {

	var OPERATORS = {
		'null': function () {
			return null;
		},
		'true': function () {
			return true;
		},
		'false': function () {
			return false;
		},
		undefined: noop,
		'+': function (self, locals, a, b) {
			a = a(self, locals);
			b = b(self, locals);
			if (isDefined(a)) {
				if (isDefined(b)) {
					return a + b;
				}
				return a;
			}
			return isDefined(b) ? b : undefined;
		},
		'-': function (self, locals, a, b) {
			a = a(self, locals);
			b = b(self, locals);
			return (isDefined(a) ? a : 0) - (isDefined(b) ? b : 0);
		},
		'*': function (self, locals, a, b) {
			return a(self, locals) * b(self, locals);
		},
		'/': function (self, locals, a, b) {
			return a(self, locals) / b(self, locals);
		},
		'%': function (self, locals, a, b) {
			return a(self, locals) % b(self, locals);
		},
		'^': function (self, locals, a, b) {
			return a(self, locals) ^ b(self, locals);
		},
		'=': noop,
		'===': function (self, locals, a, b) {
			return a(self, locals) === b(self, locals);
		},
		'!==': function (self, locals, a, b) {
			return a(self, locals) !== b(self, locals);
		},
		'==': function (self, locals, a, b) {
			return a(self, locals) == b(self, locals);
		},
		'!=': function (self, locals, a, b) {
			return a(self, locals) != b(self, locals);
		},
		'<': function (self, locals, a, b) {
			return a(self, locals) < b(self, locals);
		},
		'>': function (self, locals, a, b) {
			return a(self, locals) > b(self, locals);
		},
		'<=': function (self, locals, a, b) {
			return a(self, locals) <= b(self, locals);
		},
		'>=': function (self, locals, a, b) {
			return a(self, locals) >= b(self, locals);
		},
		'&&': function (self, locals, a, b) {
			return a(self, locals) && b(self, locals);
		},
		'||': function (self, locals, a, b) {
			return a(self, locals) || b(self, locals);
		},
		'&': function (self, locals, a, b) {
			return a(self, locals) & b(self, locals);
		},
		'|': function (self, locals, a, b) {
			return b(self, locals)(self, locals, a(self, locals));
		},
		'!': function (self, locals, a) {
			return !a(self, locals);
		}
	};


	function Rule(expression) {
		this.expression = expression;
	}

	Rule.prototype = {
		execute: function () {

		}
	};

	return Rule;
});