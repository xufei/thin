(function (doc) {
	var moduleMap = {};
	var moduleInstances = {};

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
		module: function(name, dependencies, factory) {
			moduleMap[name] = {
				name: name,
				dependencies: dependencies,
				factory: factory
			}
		},

		constant: function(key, value) {

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

thin.module("AJAX", [], function() {

});

thin.module("ModuleLoader", [], function() {

});

thin.module("EventDispatcher", [], function() {
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

thin.module("EventBus", ["EventDispatcher"], function(EventDispatcher) {
	var EventBus = {}.extend(EventDispatcher);

	return EventBus;
});
