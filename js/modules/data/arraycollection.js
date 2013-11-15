thin.define("ArrayCollection", ["_", "Events"], function (_, Events) {


	var ArrayCollection = function(arr) {
		this._arr = arr;
	};

	ArrayCollection.prototype = {
		length: function() {
			return this._arr.length;
		},

		addItem: function(item) {
			_arr.push(item);
		},

		addItemAt: function(item, index) {

		},

		removeItem: function(item) {

		},

		clearAll: function() {

		},

		contains: function(item) {
			return _.contains(this._arr, item);
		},

		itemUpdated: function(item) {

		}
	};

	return ArrayCollection;
});