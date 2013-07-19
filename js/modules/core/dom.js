thin.define("DOMSelector", [], function() {

	function DOM() {
		this.elements = [];
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

		on: function() {

		},

		off: function() {
			
		}
	};

	var DOMSelector = {
		byId: function(id) {
			var dom = new DOM();
			dom.elements.push(document.getElementById(id));

			return dom;
		},

		byName: function(name) {

		},

		byTagName: function(tagName) {

		}
	};

	return DOMSelector;	
});