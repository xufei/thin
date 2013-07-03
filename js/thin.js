(function (doc) {
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

	var addListener = document.addEventListener || document.attachEvent,
		removeListener = document.removeEventListener || document.detachEvent;

	var eventName = document.addEventListener ? "DOMContentLoaded" : "onreadystatechange";

	addListener.call(document, eventName, function () {
		for (var i = 0; i < readyFunctions.length; i++) {
			readyFunctions[i]();
		}
	}, false);

	//简单的对象属性复制，把源对象上的属性复制到自己身上，只复制一层
	Object.prototype.extend = function (base) {
		for (var key in base) {
			if (base.hasOwnProperty(key)) {
				this[key] = base[key];
			}
		}
		return this;
	};

	var Observer = {
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

	window.thin = thin.extend({
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

		use: function (name, isViewModel) {
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

				if (isViewModel) {
					args.push({}.extend(Observer));
				}

				module.entity = module.factory.apply(noop, args);
			}

			return module.entity;
		},

		require: function (pathArr, callback) {
			for (var i = 0; i < pathArr.length; i++) {
				loadFile(pathArr[i]);
			}

			function loadFile(file) {
				var head = document.getElementsByTagName('head')[0];
				var script = document.createElement('script');
				script.setAttribute('type', 'text/javascript');
				script.setAttribute('src', file + '.js');
				script.onload = script.onreadystatechange = function () {
					if ((!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
						fileMap[file] = true;
						head.removeChild(script);
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

				if (allLoaded) {
					callback();
				}
			}
		},

		ready: function (handler) {
			readyFunctions.push(handler);
		},

		error: function () {

		},

		log: function (obj) {
			console.log(obj);
		}
	});

	//Observer
	thin.define("Observer", [], function () {
		return Observer;
	});

	//Global observer, all event go my home
	thin.define("EventBus", ["Observer"], function (Observer) {
		var EventBus = {}.extend(Observer);

		return EventBus;
	});
})(document);
