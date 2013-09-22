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

		undefined: function () {
		},

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

	function Expression(text) {
		this.text = text;

		this.index = 0;
	}

	Expression.prototype = {
		build: function () {

		},

		readNumber: function (index) {
			var number = "";
			var start = index;
			while (index < this.text.length) {
				var ch = lowercase(this.text.charAt(index));
				if (ch == '.' || isNumber(ch)) {
					number += ch;
				} else {
					var peekCh = this.peek();
					if (ch == 'e' && isExpOperator(peekCh)) {
						number += ch;
					} else if (isExpOperator(ch) &&
						peekCh && isNumber(peekCh) &&
						number.charAt(number.length - 1) == 'e') {
						number += ch;
					} else if (isExpOperator(ch) &&
						(!peekCh || !isNumber(peekCh)) &&
						number.charAt(number.length - 1) == 'e') {
						//throwError('Invalid exponent');
					} else {
						break;
					}
				}
				index++;
			}
			number = 1 * number;
			tokens.push({index: start, text: number, json: true,
				fn: function () {
					return number;
				}});
		},

		readString: function (quote) {
			var start = this.index;
			this.index++;
			var string = "";
			var rawString = quote;
			var escape = false;
			while (this.index < this.text.length) {
				var ch = this.text.charAt(this.index);
				rawString += ch;
				if (escape) {
					if (ch == 'u') {
						var hex = this.text.substring(this.index + 1, this.index + 5);
						if (!hex.match(/[\da-f]{4}/i))
							throwError("Invalid unicode escape [\\u" + hex + "]");
						this.index += 4;
						string += String.fromCharCode(parseInt(hex, 16));
					} else {
						var rep = ESCAPE[ch];
						if (rep) {
							string += rep;
						} else {
							string += ch;
						}
					}
					escape = false;
				} else if (ch == '\\') {
					escape = true;
				} else if (ch == quote) {
					this.index++;
					tokens.push({
						index: start,
						text: rawString,
						string: string,
						json: true,
						fn: function () {
							return string;
						}
					});
					return;
				} else {
					string += ch;
				}
				this.index++;
			}
			throwError("Unterminated quote", start);
		},

		readIdent: function () {
			var ident = "",
				start = index,
				lastDot, peekIndex, methodName, ch;

			while (index < text.length) {
				ch = text.charAt(index);
				if (ch == '.' || isIdent(ch) || isNumber(ch)) {
					if (ch == '.') lastDot = index;
					ident += ch;
				} else {
					break;
				}
				index++;
			}

			//check if this is not a method invocation and if it is back out to last dot
			if (lastDot) {
				peekIndex = index;
				while (peekIndex < text.length) {
					ch = text.charAt(peekIndex);
					if (ch == '(') {
						methodName = ident.substr(lastDot - start + 1);
						ident = ident.substr(0, lastDot - start);
						index = peekIndex;
						break;
					}
					if (isWhitespace(ch)) {
						peekIndex++;
					} else {
						break;
					}
				}
			}


			var token = {
				index: start,
				text: ident
			};

			if (OPERATORS.hasOwnProperty(ident)) {
				token.fn = token.json = OPERATORS[ident];
			} else {
				var getter = getterFn(ident, csp, text);
				token.fn = extend(function (self, locals) {
					return (getter(self, locals));
				}, {
					assign: function (self, value) {
						return setter(self, ident, value, text);
					}
				});
			}

			tokens.push(token);

			if (methodName) {
				tokens.push({
					index: lastDot,
					text: '.',
					json: false
				});
				tokens.push({
					index: lastDot + 1,
					text: methodName,
					json: false
				});
			}
		},

		peek: function (i) {
			var num = i || 1;
			return this.index + num < this.text.length ? this.text.charAt(this.index + num) : false;
		}
	};

	function isExpOperator(ch) {
		return ch == '-' || ch == '+' || isNumber(ch);
	}

	function isNumber(ch) {
		return '0' <= ch && ch <= '9';
	}

	function isWhitespace(ch) {
		return ch == ' ' || ch == '\r' || ch == '\t' ||
			ch == '\n' || ch == '\v' || ch == '\u00A0'; // IE treats non-breaking space as \u00A0
	}

	function isIdent(ch) {
		return 'a' <= ch && ch <= 'z' ||
			'A' <= ch && ch <= 'Z' ||
			'_' == ch || ch == '$';
	}

	function unaryFn(fn, right) {
		return extend(function (self, locals) {
			return fn(self, locals, right);
		}, {
			constant: right.constant
		});
	}

	function binaryFn(left, fn, right) {
		return extend(function (self, locals) {
			return fn(self, locals, left, right);
		}, {
			constant: left.constant && right.constant
		});
	}

	function ternaryFn(left, middle, right) {
		return extend(function (self, locals) {
			return left(self, locals) ? middle(self, locals) : right(self, locals);
		}, {
			constant: left.constant && middle.constant && right.constant
		});
	}


	function Rule(expression) {
		this.context = null;
		this.expression = expression;
		this.l = null;
		this.r = null;
		this.m = null;
		this.op = null;
	}

	Rule.prototype = {
		generateTree: function () {
			var exp = this.expression;
			for (var i = 0; i < exp.length; i++) {
				while (this.isEmpty(exp.charAt(i))) {
					i++;
				}
			}

			var char = exp.charAt(i);
		},

		isOperator: function (str) {
			return OPERATORS[str] != null;
		},

		isEmpty: function (str) {
			return str.trim().length > 0;
		},

		execute: function () {
			switch (this.type) {
				case 1:
				{
					unaryFn(OPERATORS[this.op], this.r);
					break;
				}
				case 2:
				{
					binaryFn(OPERATORS[this.op], this.l, this.r);
					break;
				}
				case 3:
				{
					ternaryFn(OPERATORS[this.op], this.l, this.m, this.r);
					break;
				}
			}
		}
	};

	return Rule;
});