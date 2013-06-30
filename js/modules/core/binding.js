

thin.define("Component", ["AJAX", "DOMUtil"], function(AJAX, DOMHelper) {
	var vmMap = {};

	function loadTemplate(url, vm) {
		AJAX.get(url, function() {
			var fragment = DOMHelper.fragment(url);
			var template = parseTemplate(fragment);

			if (vm) {
				compile(template, vm);
			}
		});
	}

	function parseTemplate(dom) {
		parseElement(dom);
	}

	function parseElement(element, vm) {
		if (element.nodeType == "1") {
			var model = vm;
			var attrs = element.attributes;
			for (var i=0; i<attrs.length; i++) {
				var attr = attrs[i];
				if (attr.name.indexOf("vm-") == 0) {
					var type = attr.name.slice(3);

					switch (type) {
						case "model":
							model = bindModel(element, attr.value);
							break;
						case "value":
							bindValue(element, attr.value, model);
							break;
						case "click":
							bindClick(element, attr.value, model);
							break;
					}
				}
			}

			for (var i=0; i<element.children.length; i++) {
				parseElement(element.children[i], model);
			}
		}
	}

	function bindModel(element, modelName) {
		var model = thin.use(modelName, true);
		var instance = new model();

		return instance;
	}

	function bindValue(element, valueName, vm) {
		element.value = vm[valueName];
	}

	function bindClick(element, valueName, vm) {
		vm[valueName]();
	}

	function compile(template, vm) {

	}

	return {
		load: loadTemplate,
		parse: parseTemplate
	}
});