

thin.define("Component", [], function() {
    var Binder = {
        $watch: function(key, watcher) {
            if (!this.$valueWatchers[key]) {
                this.$valueWatchers[key] = {
                    value: this[key],
                    list: []
                };

                Object.defineProperty(this, key, {
                    set: function(val) {
                        var oldValue = this.$valueWatchers[key].value;
                        this.$valueWatchers[key].value = val;

                        for (var i=0; i<this.$valueWatchers[key].list.length; i++) {
                            this.$valueWatchers[key].list[i](val, oldValue);
                        }
                    },

                    get: function() {
                        return this.$valueWatchers[key].value;
                    }
                });
            }

            this.$valueWatchers[key].list.push(watcher);
        }
    };

	var vmMap = {};

	function parseElement(element, vm) {
		var model = vm;

		if (element.getAttribute("vm-model")) {
			model = bindModel(element.getAttribute("vm-model"));
		}

		for (var i=0; i<element.attributes.length; i++) {
			parseAttribute(element, element.attributes[i], model);
		}

		for (var i=0; i<element.children.length; i++) {
			parseElement(element.children[i], model);
		}

        if (model != vm) {
            for (var key in model.$valueWatchers) {
                model[key] = model.$valueWatchers[key].value;
            }

            for (var key in model.$enableWatchers) {
                model[key] = model.$enableWatchers[key].value;
            }

            for (var key in model.$visibleWatchers) {
                model[key] = model.$visibleWatchers[key].value;
            }

            if (model.$initializer) {
                model.$initializer();
            }
        }
	}

	function parseAttribute(element, attr, model) {
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

	function bindModel(modelName) {
		thin.log("model" + modelName);

		var model = thin.use(modelName, true);

		return new model().extend(Binder).extend({
            $valueWatchers: {},
            $enableWatchers: {},
            $visibleWatchers: {}
        });
	}

	function bindValue(element, key, vm) {
		thin.log("value" + vm);

        vm.$watch(key, function(value, oldValue) {
            element.value = value || "";
        });

		element.onkeyup = function() {
			vm[key] = element.value;
		};

		element.onpaste = function() {
			vm[key] = element.value;
		};
	}

	function bindInit(element, valueName, vm) {
		thin.log("init" + vm);

        vm.$initializer = (function(model) {
			return function() {
				model[valueName]();
			};
		})(vm);
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

	return {
		parse: parseElement
    }
});