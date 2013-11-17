thin.define("ObjectEvent", [], function() {
	return {

	};
});

thin.define("WatchedObject", [], function() {

	var WatchedObject = function(data) {
		this._data = data;
		this._watchers = [];
	};

	WatchedObject.prototype = {
		$watch: function(watchFn, listenerFn) {
			var watcher = {
				watchFn: watchFn,
				listenerFn: listenerFn
			};
			this._watchers.push(watcher);
		},

		hasProperty: function(key) {
			return key in this._data;
		},

		defineProperty: function(key, value) {

		}
	};

	return WatchedObject;
});