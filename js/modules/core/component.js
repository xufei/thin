thin.define("Component.Loader", ["AJAX"], function (AJAX) {

	function load(url) {
		AJAX.get(url, function (data) {
			alert(data);
		});
	}

	return {
		load: load
	};
});

thin.define("Component.Parser", [], function () {
	var xml = new XML();
	XMLHttpRequest.load();
});

thin.define("Component", [], function () {

});