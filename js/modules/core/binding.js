thin.define("DOMBinding", [], function () {
	var Binder = {
		$watch: function (key, watcher) {
			if (!this.$watchers[key]) {
				this.$watchers[key] = {
					value: this[key],
					list: []
				};

				Object.defineProperty(this, key, {
					set: function (val) {
						var oldValue = this.$watchers[key].value;
						this.$watchers[key].value = val;

						for (var i = 0; i < this.$watchers[key].list.length; i++) {
							this.$watchers[key].list[i](val, oldValue);
						}
					},

					get: function () {
						return this.$watchers[key].value;
					}
				});
			}

			this.$watchers[key].list.push(watcher);
		}
	};

	var vmMap = {};

	function parseElement(element, vm) {
		var model = vm;

		if (element.getAttribute("vm-model")) {
			model = bindModel(element.getAttribute("vm-model"));
		}

		for (var i = 0; i < element.attributes.length; i++) {
			parseAttribute(element, element.attributes[i], model);
		}

		for (var i = 0; i < element.children.length; i++) {
			parseElement(element.children[i], model);
		}

		if (model != vm) {
			for (var key in model.$watchers) {
				model[key] = model.$watchers[key].value;
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
				case "init":
					bindInit(element, attr.value, model);
					break;
				case "value":
					bindValue(element, attr.value, model);
					break;
				case "list":
					bindList(element, attr.value, model);
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

	function bindModel(name) {
		thin.log("binding model: " + name);

		var model = thin.use(name);
		var instance = new model().extend(Binder);
		instance.$watchers = {};

		return instance;
	}

	function bindValue(element, key, vm) {
		thin.log("binding value: " + key);

		vm.$watch(key, function (value, oldValue) {
			element.value = value || "";
		});

		/*
		 switch () {
		 case "TextInput": {

		 }
		 }
		 */
		bindTextValue(element, key, vm);

		function bindTextValue(el, key, model) {

			el.onkeyup = function () {
				model[key] = el.value;
			};

			el.onpaste = function () {
				model[key] = el.value;
			};
		}

		function bindSelectValue() {
			el.onchange = function () {
				vm[key] = el.value;
			}
		}
	}

	function bindList(element, key, vm) {
		thin.log("binding list: " + key);

		vm.$watch(key, function (value, oldValue) {
			var selectedValue = element.value;
			element.innerHTML = null;

			for (var i = 0; i < value.length; i++) {
				var item = document.createElement("option");
				item.innerHTML = value[i].label;
				item.value = value[i].key;

				element.appendChild(item);
			}
			element.value = selectedValue;
		});
	}

	function bindInit(element, key, vm) {
		thin.log("binding init: " + key);

		vm.$initializer = (function (model) {
			return function () {
				model[key]();
			};
		})(vm);
	}

	function bindClick(element, key, vm) {
		thin.log("binding click: " + key);

		element.onclick = function () {
			vm[key]();
		}
	}

	function bindEnable(element, key, vm, direction) {
		thin.log("binding enable: " + key);

		vm.$watch(key, function (value, oldValue) {
			element.disabled = value ^ direction ? true : false;
		});
	}

	function bindVisible(element, key, vm, direction) {
		thin.log("binding visible: " + key);

		vm.$watch(key, function (value, oldValue) {
			element.style.display = value ^ direction ? "none" : "";
		});
	}

	return {
		parse: parseElement
	}
});