thin.define("DOMSelector", [], function () {
	function DOM() {
		this.elements = [];
		this.eventMap = [];
	}

	DOM.prototype = {
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
			var dom = new DOM();
			dom.elements = [].slice.call(document.getElementsByName(name));
			return dom;
		},

		byTagName: function (tagName) {
			var dom = new DOM();
			dom.elements = [].slice.call(document.getElementsByTagName(tagName));
			return dom;
		},

		bySelector: function (selector) {
			var dom = new DOM();
			dom.elements = [].slice.call(document.querySelector(selector));
			return dom;
		}
	};

	return DOMSelector;
});