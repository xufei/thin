(function (win, doc, _) {
	var moduleMap = {};
	var fileMap = {};
	var readyFunctions = [];

	var noop = function () {
	};

	var uuid = function () {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	};

	var thin = function () {
	};

	var addListener = doc.addEventListener || doc.attachEvent,
		removeListener = doc.removeEventListener || doc.detachEvent;

	var eventName = doc.addEventListener ? "DOMContentLoaded" : "onreadystatechange";

	addListener.call(doc, eventName, function () {
		for (var i = readyFunctions.length - 1; i >= 0; i--) {
			if (readyFunctions[i]) {
				for (var j = 0; j < readyFunctions[i].length; j++) {
					readyFunctions[i][j]();
				}
			}
		}
	}, false);

	var Events = {
		on: function (eventType, handler) {
			if (!this.eventMap) {
				this.eventMap = {};
			}

			//multiple event listener
			if (!this.eventMap[eventType]) {
				this.eventMap[eventType] = [];
			}
			this.eventMap[eventType].push(handler);
		},

		off: function (eventType, handler) {
			for (var i = 0; i < this.eventMap[eventType].length; i++) {
				if (this.eventMap[eventType][i] === handler) {
					this.eventMap[eventType].splice(i, 1);
					break;
				}
			}
		},

		fire: function (event) {
			var eventType = event.type;
			if (this.eventMap && this.eventMap[eventType]) {
				for (var i = 0; i < this.eventMap[eventType].length; i++) {
					this.eventMap[eventType][i](event);
				}
			}
		}
	};

	_.extend(thin, {
		base: "../js/modules/",

		define: function (name, dependencies, factory) {
			if (!moduleMap[name]) {
				var module = {
					name: name,
					dependencies: dependencies,
					factory: factory
				};

				moduleMap[name] = module;
			}

			return moduleMap[name];
		},

		use: function (name) {
			var module = moduleMap[name];

			if (!module.entity) {
				var args = [];
				for (var i = 0; i < module.dependencies.length; i++) {
					if (moduleMap[module.dependencies[i]].entity) {
						args.push(moduleMap[module.dependencies[i]].entity);
					}
					else {
						args.push(this.use(module.dependencies[i]));
					}
				}

				module.entity = module.factory.apply(noop, args);
			}

			return module.entity;
		},

		require: function (pathArr, callback) {
			var base = this.base;
			for (var i = 0; i < pathArr.length; i++) {
				loadFile(pathArr[i]);
			}

			function loadFile(file) {
				var head = doc.getElementsByTagName('head')[0];
				var script = doc.createElement('script');
				script.setAttribute('type', 'text/javascript');
				script.setAttribute('src', base + file + '.js');
				script.onload = script.onreadystatechange = function () {
					if ((!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
						fileMap[file] = true;
						//head.removeChild(script);
						checkAllFiles();
					}
				};
				head.appendChild(script);
			}

			function checkAllFiles() {
				var allLoaded = true;
				for (var i = 0; i < pathArr.length; i++) {
					if (!fileMap[pathArr[i]]) {
						allLoaded = false;
						break;
					}
				}

				if (allLoaded && callback) {
					callback();
				}
			}
		},

		ready: function (handler, priority) {
			priority = (priority === null) ? 1 : priority;

			if (!readyFunctions[priority]) {
				readyFunctions[priority] = [];
			}
			readyFunctions[priority].push(handler);
		},

		error: function () {

		},

		log: function (obj) {
			try {
				console.log(obj);
			}
			catch (ex) {

			}
		}
	});

	_.extend(thin, Events);

	win.thin = thin;

	thin.define("_", [], function() {
		return _;
	});

	//Events
	thin.define("Events", [], function () {
		return Events;
	});

	thin.on("ready", function () {
		thin.require(["core/binding"], function () {
			var binding = thin.use("DOMBinding");
			binding.parse(doc.body);
		});
	});
})(window, document, _);
