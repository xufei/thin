thin.define("TreeEvent", [], function() {
	return {
		ADD: "add",
		REMOVE: "remove",
		REMOVE_ALL: "removeAll"
	};
});

thin.define("TreeModel", ["_", "Events", "TreeEvent"], function (_, Events, TreeEvent) {


	var TreeModel = function(arr) {
		this._arr = arr;
	};

	TreeModel.prototype = {
		length: function() {
			return this._arr.length;
		},

		addItem: function(item) {
			_arr.push(item);

			this.fire({
				type: CollectionEvent.ADD,
				item: item
			});
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

	return TreeModel;
});
