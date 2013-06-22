(function () {
	var moduleMap = {};
	var moduleInstances = {};

	var noop = function () {
	};

	var uuid = function () {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	};

	var thin = {
		module: function(name, dependencies, factory) {
			moduleMap[name] = {
				name: name,
				dependencies: dependencies,
				factory: factory
			}
		},

		get: function(name) {
			var module = moduleMap[name];

			var args = [];
			for (var i=0; i<module.dependencies.length; i++) {
				args.push(this.get(module.dependencies[i]));
			}

			var instance = module.factory.apply(noop, args);
			var id = uuid();
			instance.id = id;
			moduleInstances[id] = instance;
			return instance;
		}
	};

	window.thin = thin;
})();