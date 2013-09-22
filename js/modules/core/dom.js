thin.define("DOMSelector", [], function () {
	function DOMWrapper() {
		this.elements = [];
		this.eventMap = [];
	}

	DOMWrapper.prototype = {
		attr: function (key, value) {
			if (arguments.length == 2) {
				this.elements.forEach(function (element) {
					element.setAttribute(key, value);
				});
				return this;
			}
			else if (arguments.length == 1) {
				if (this.elements.length > 0) {
					return this.elements[0].getAttribute(key);
				}
			}
		},

		addClass: function (className) {
			this.elements.forEach(function (element) {
				element.classList.add(className);
			});
			return this;
		},

		removeClass: function (className) {
			this.elements.forEach(function (element) {
				element.classList.remove(className);
			});
			return this;
		},

		show: function () {
			this.elements.forEach(function (element) {
				element.style.display = "";
			});
			return this;
		},

		hide: function () {
			this.elements.forEach(function (element) {
				element.style.display = "none";
			});
			return this;
		},

		on: function (eventType, handler) {
			switch (eventType) {
				case "click":
					this.click(handler);
					break;
			}
			return this;
		},

		off: function (eventType, handler) {

		},

		click: function (handler) {
			this.elements.forEach(function (element) {
				thin.on.call(element, "click", handler);
			});
			return this;
		},

		querySelector: function (selector) {

		}
	};

	var DOMSelector = {
		byId: function (id) {
			var dom = new DOM();
			dom.elements.push(document.getElementById(id));

			return dom;
		},

		byName: function (name) {
			var dom = new DOMWrapper();
			dom.elements = [].slice.call(document.getElementsByName(name));
			return dom;
		},

		byTagName: function (tagName) {
			var dom = new DOMWrapper();
			dom.elements = [].slice.call(document.getElementsByTagName(tagName));
			return dom;
		},

		bySelector: function (selector) {
			var dom = new DOMWrapper();
			dom.elements = [].slice.call(document.querySelector(selector));
			return dom;
		},

		create: function(emmet) {
			var tree = new ExpressionTree(emmet);
		}
	};

	// todo, implement an emmet creator

	var EmmetOperators = {
		Child: ">",
		Sibling: "+",
		Climb: "^",
		Multiplication: "*",
		GroupOpen: "(",
		GroupClose: ")",
		ID: "#",
		Class: ".",
		AttributeOpen: "[",
		AttributeClose: "]",
		TextOpen: "{",
		TextClose: "}"
	};

	var EmmetFunctions = {
		">": function(){},
		"+": function(){},
		"^": function(){},
		"*": function(){},
		"(": function(){},
		")": function(){},
		"#": function(){},
		".": function(){},
		"[": function(){},
		"]": function(){},
		"{": function(){},
		"}": function(){}
	};

	var EmmetParser = {
		currentIndex: 0,
		groupStack: [],
		attrStack: [],
		textStack: [],

		isOperator: function(char) {

		},

		readOperator: function() {

		},

		readString: function() {

		},

		readNumber: function() {
			var number = "";
			var start = this.currentIndex;
			while (this.currentIndex < this.text.length) {
				var diff = this.text.charCodeAt(this.currentIndex) - 49;
				if (diff >= 0 && diff <= 9) {
					number += this.text.charAt(this.currentIndex);
				}
				else {
					break;
				}
				this.currentIndex++;
			}
			number = 1 * number;
			return number;
		},

		parseString: function(text) {
			this.str = text;
			var tokens = [];
			for (var i=0; i<text.length; i++) {
				if (this.isOperator(text.charAt(i))) {
					tokens.push(text.charAt(i));
				}
			}
		}
	};

	var ExpressionTree = function(expression) {
		this.expression = expression;
	};

	ExpressionTree.prototype = {
		generateTree: function() {

		}
	};

	return DOMSelector;
});