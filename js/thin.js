(function (doc) {
	var moduleMap = {};
	var fileMap = {};

	//简单的对象属性复制，把源对象上的属性复制到自己身上，只复制一层
	Object.prototype.extend = function (base) {
		for (var key in base) {
			if (base.hasOwnProperty(key)) {
				this[key] = base[key];
			}
		}
		return this;
	};

	var noop = function () {
	};

	var uuid = function () {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	};

	var thin = {
		define: function(name, dependencies, factory) {
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

		use: function(name) {
			var module = moduleMap[name];

			if (!module.entity) {
				var args = [];
				for (var i=0; i<module.dependencies.length; i++) {
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

		require: function(pathArr, callback) {

			for (var i=0; i<pathArr.length; i++) {
				var path = pathArr[i];

				if (!fileMap[path]) {
					var head = document.getElementsByTagName('head')[0];
					var node = document.createElement('script');
					node.type = 'text/javascript';
					node.async = 'true';
					node.src = path + '.js';
					node.onload = function() {
						head.removeChild(node);
						checkAllFiles();
					};
					fileMap[path] = true;
					head.appendChild(node);
				}
			}

			function checkAllFiles() {
				var allLoaded = true;
				for (var i=0; i<pathArr.length; i++) {
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

		ready: function() {

		},

		error: function() {

		},

		log: function() {

		}
	};

	window.thin = thin;
})(document);

thin.define("AJAX", [], function() {

});

thin.define("ModuleLoader", [], function() {

});

thin.define("EventDispatcher", [], function() {
	//事件派发机制的实现
	var EventDispatcher = {
		addEventListener: function (eventType, handler) {
			//事件的存储
			if (!this.eventMap) {
				this.eventMap = {};
			}

			//对每个事件，允许添加多个监听
			if (!this.eventMap[eventType]) {
				this.eventMap[eventType] = [];
			}

			//把回调函数放入事件的执行数组
			this.eventMap[eventType].push(handler);
		},

		removeEventListener: function (eventType, handler) {
			for (var i = 0; i < this.eventMap[eventType].length; i++) {
				if (this.eventMap[eventType][i] === handler) {
					this.eventMap[eventType].splice(i, 1);
					break;
				}
			}
		},

		dispatchEvent: function (event) {
			var eventType = event.type;
			if (this.eventMap && this.eventMap[eventType]) {
				for (var i = 0; i < this.eventMap[eventType].length; i++) {
					//把对当前事件添加的处理函数拿出来挨个执行
					this.eventMap[eventType][i](event);
				}
			}
		}
	};

	return EventDispatcher;
});

thin.define("EventBus", ["EventDispatcher"], function(EventDispatcher) {
	var EventBus = {}.extend(EventDispatcher);

	return EventBus;
});
