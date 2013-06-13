(function (doc) {
	var modules = {};
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

	/**
	 * 获取函数的形参列表
	 * @param fn 待分析的函数
	 * @returns {Array} 形参列表
	 */
	function annotate(fn) {
		var parameters = [];

		if (fn.length > 0) {
			var fnText = fn.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, "");		//去除注释
			var argDeclaration = fnText.match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m);

			var arr = argDeclaration[1].split(",");
			for(var i=0; i<arr.length; i++) {
				arr[i].replace(/^\s*(_?)(\S+?)\1\s*$/, function(all, underscore, name){
					parameters.push(name);
				});
			}
		}
		return parameters;
	}

	/**
	 * Module constructor
	 * @param name Module name
	 * @param dependencies
	 * @param constructor
	 * @constructor
	 */
	function Module(name, dependencies, factory) {
		this.name = name;
		this.dependencies = dependencies;
		this.factory = factory;
	}

	Module.prototype = {
		createInstance: function () {
			var dependencies = annotate(this.factory);

			var args = [];
			for (var i=0; i<dependencies.length; i++) {
				args.push(modules[dependencies[i]].createInstance());
			}

			var instance = this.factory.apply(noop, args);
			var id = uuid();
			moduleInstances[id] = instance;
			return instance;
		}
	};

	var noop = function () {
	};

	var uuid = function () {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	};

	var thin = function () {
		return thin.init();
	};

	thin.init = function() {

	};

	thin.extend({
		module: function (name, dependencies, constructor) {
			if (!modules[name]) {
				var module = new Module(name, dependencies, constructor);

				modules[name] = module;
			}

			return module;
		},

		constant: function(key, value) {

		},

		get: function(name) {
			return modules[name].createInstance();
		},

		ready: function() {

		},

		error: function() {

		},

		log: function() {

		}
	});

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

thin.module("DataGrid", ["EventDispatcher"], function(EventDispatcher) {
	//作为一个控件，它的容器必须传入
	function DataGrid(element) {
		this.columns = [];
		this.rows = [];

		element.innerHTML = '<table class="table table-bordered table-striped"><thead><tr></tr></thead><tbody></tbody><table>';

		this.header = element.firstChild.tHead;
		this.tbody = element.firstChild.tBodies[0];

		this.selectedRow = null;
	}

	DataGrid.prototype = {
		loadColumns: function (columns) {
			if (this.header.rows.length > 0) {
				this.header.removeChild(this.header.rows[0]);
			}
			var tr = this.header.insertRow(0);

			for (var i = 0; i < columns.length; i++) {
				var th = tr.insertCell(i);
				th.innerHTML = columns[i].label;
			}
			this.columns = columns;
		},

		loadData: function (data) {
			for (var i = 0; i < data.length; i++) {
				this.insertRow(data[i]);
			}

			//跟外面说一声，数据加载好了
			var event = {
				type: "loadCompleted",
				target: this
			};
			this.dispatchEvent(event);
		},

		insertRow: function (data) {
			var row = new DataRow(data, this);
			this.tbody.appendChild(row.dom);

			this.rows.push(row);

			var that = this;
			row.addEventListener("selected", function (event) {
				that.select(event.row);
			});

			//已经成功添加了新行
			var event = {
				type: "rowInserted",
				newRow: row,
				target: this
			};
			this.dispatchEvent(event);
		},

		removeRow: function (row) {
			if (row === this.selectedRow) {
				this.selectedRow = null;
			}

			this.tbody.removeChild(row.dom);
			row.destroy();

			for (var i = 0; i < this.rows.length; i++) {
				if (this.rows[i] == row) {
					this.rows.splice(i, 1);
					break;
				}
			}

			//已经移除
			var event = {
				type: "rowRemoved",
				target: this
			};
			this.dispatchEvent(event);
		},

		select: function (row) {
			var event = {
				type: "changed",
				target: this,
				oldRow: this.selectedRow,
				newRow: row
			};

			if (this.selectedRow) {
				this.selectedRow.select(false);
			}

			if (row) {
				row.select(true);
			}

			this.selectedRow = row;

			this.dispatchEvent(event);
		}
	}.extend(EventDispatcher);

	function DataRow(data, grid) {
		this.data = data;
		this.grid = grid;

		this.create();
	}

	DataRow.prototype = {
		create: function () {
			var row = document.createElement("tr");
			for (var i = 0; i < this.grid.columns.length; i++) {
				var cell = document.createElement("td");
				cell.innerHTML = this.data[this.grid.columns[i].field] || "";
				row.appendChild(cell);
			}
			this.dom = row;

			var that = this;
			row.onclick = function (event) {
				//通知上级，我被点了
				var newEvent = {
					type: "selected",
					target: that,
					row: that
				};
				that.dispatchEvent(newEvent);
			}
		},

		destroy: function () {
			this.dom = null;
			this.data = null;
			this.grid = null;
		},

		select: function (flag) {
			if (flag) {
				this.dom.className = "info";
			}
			else {
				this.dom.className = "";
			}
		},

		set: function (key, value) {
			this.data[key] = value;

			for (var i = 0; i < this.grid.columns.length; i++) {
				if (this.grid.columns[i].field === key) {
					this.dom.childNodes[i].innerHTML = value;
					break;
				}
			}
		},

		get: function (key) {
			return this.data[key];
		},

		refresh: function (data) {
			this.data = data;

			for (var i = 0; i < this.grid.columns.length; i++) {
				this.dom.childNodes[i].innerHTML = data[this.grid.columns[i].field] || "";
			}
		}
	}.extend(EventDispatcher);

	return DataGrid;
});