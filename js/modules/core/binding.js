

thin.define("Component", ["AJAX", "DOMUtil"], function(AJAX, DOMHelper) {
	var vmMap = {};
	var queue = [];

	function loadTemplate(url, vm) {
		AJAX.get(url, function() {
			var fragment = DOMHelper.fragment(url);
			var template = parseTemplate(fragment);

			if (vm) {
				compile(template, vm);
			}
		});
	}

	function next() {
		while (queue.length > 0)
			queue.shift()();
	}

	function parseTemplate(dom) {
		parseElement(dom);

		next();
	}

	function parseElement(element, vm) {
		if (element.nodeType == "1") {
			var model = vm;

			if (element.getAttribute("vm-model")) {
				model = bindModel(element, element.getAttribute("vm-model"));
			}

			var attrs = element.attributes;
			for (var i=0; i<attrs.length; i++) {
				var attr = attrs[i];
				if (attr.name.indexOf("vm-") == 0) {
					var type = attr.name.slice(3);

					switch (type) {
						case "model":
							//model = bindModel(element, attr.value);
							break;
						case "init":
							bindInit(element, attr.value, model);
							break;
						case "value":
							bindValue(element, attr.value, model);
							break;
						case "click":
							bindClick(element, attr.value, model);
							break;
						case "enable":
							bindEnable(element, attr.value, model, true);
							break;
						case "disable":
							bindEnable(element, attr.value, model, false);
							break;
						case "visible":
							bindVisible(element, attr.value, model, true);
							break;
						case "invisible":
							bindVisible(element, attr.value, model, false);
							break;
						case "element":
							model[attr.value] = element;
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
		thin.log("model" + modelName);

		var model = thin.use(modelName, true);
		var instance = new model();

		instance.$valueWatchers = {};
		instance.$enableWatchers = {};
		instance.$visibleWatchers = {};

		return instance;
	}

	function bindValue(element, valueName, vm) {
		thin.log("value" + vm);

		if (!vm.$valueWatchers[valueName]) {
			vm.$valueWatchers[valueName] = {
				value: vm[valueName],
				list: []
			};

			Object.defineProperty(vm, valueName, {
				set: function(val) {
					vm.$valueWatchers[valueName].value = val;
					element.value = val || "";
				},

				get: function() {
					return vm.$valueWatchers[valueName].value;
				}
			});
		}

		vm.$valueWatchers[valueName].list.push({
			element: element
		});

		element.onkeyup = function() {
			vm[valueName] = element.value;
		};
	}

	function bindInit(element, valueName, vm) {
		thin.log("init" + vm);

		queue.push((function(model) {
			return function() {
				model[valueName]();
			};
		})(vm));
	}

	function bindClick(element, valueName, vm) {
		thin.log("click" + vm);

		element.onclick = function() {
			vm[valueName]();
		}
	}

	function bindEnable(element, valueName, vm, direction) {
		thin.log("enable" + vm);

		if (!vm.$enableWatchers[valueName]) {
			vm.$enableWatchers[valueName] = {
				value: vm[valueName],
				list: []
			};

			Object.defineProperty(vm, valueName, {
				set: function(val) {
					this.$enableWatchers[valueName].value = val;

					for (var i=0; i<vm.$enableWatchers[valueName].list.length; i++) {
						var item = vm.$enableWatchers[valueName].list[i];
						item.element.disabled = val ^ item.direction ? true : false;
					}
				},

				get: function() {
					return this.$enableWatchers[valueName].value;
				}
			});
		}

		vm.$enableWatchers[valueName].list.push({
			element: element,
			direction: direction
		});
	}

	function bindVisible(element, valueName, vm, direction) {
		thin.log("visible" + vm);

		if (!vm.$visibleWatchers[valueName]) {
			vm.$visibleWatchers[valueName] = {
				value: vm[valueName],
				list: []
			};

			Object.defineProperty(vm, valueName, {
				set: function(val) {
					for (var i=0; i<vm.$visibleWatchers[valueName].list.length; i++) {
						this.$visibleWatchers[valueName].value = val;

						var item = vm.$visibleWatchers[valueName].list[i];
						item.element.style.display = val ^ item.direction ? "none" : "";
					}
				},

				get: function() {
					return this.$visibleWatchers[valueName].value;
				}
			});
		}

		vm.$visibleWatchers[valueName].list.push({
			element: element,
			direction: direction
		});
	}

	function compile(template, vm) {

	}

	return {
		load: loadTemplate,
		parse: parseTemplate
	}
});