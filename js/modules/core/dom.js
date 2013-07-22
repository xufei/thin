thin.define("DOMSelector", ["Observer"], function(Observer) {
	function DOM() {
		this.elements = [];
		this.eventMap = [];
	}

	DOM.prototype = {
		attr: function() {
			this.elements.forEach(function(element) {

			});
			return this;
		},

		addClass: function(className) {

		},

		removeClass: function(className) {

		},

		show: function() {
			this.elements.forEach(function(element) {
				element.style.display = "";
			});
		},

		hide: function() {
			this.elements.forEach(function(element) {
				element.style.display = "none";
			});
		},

		on: function(eventType, handler) {
			switch (eventType) {
				case "click":
					this.click(handler);
					break;
			}
		},

		off: function(eventType, handler) {

		},

		click: function(handler) {
			this.elements.forEach(function(element) {
				thin.on.call(element, "click", handler);
			});
		}
	};

	var DOMSelector = {
		byId: function(id) {
			var dom = new DOM();
			dom.elements.push(document.getElementById(id));

			return dom;
		},

		byName: function(name) {
			var dom = new DOM();
			dom.elements = [].slice.call(document.getElementsByName(name));
			return dom;
		},

		byTagName: function(tagName) {
			var dom = new DOM();
			dom.elements = [].slice.call(document.getElementsByTagName(tagName));
			return dom;
		},

		bySelector: function(selector) {

		}
	};

	return DOMSelector;	
});