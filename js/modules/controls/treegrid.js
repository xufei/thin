thin.define("TreeGrid", ["_", "Events"], function (_, Events) {
	//作为一个控件，它的容器必须传入
	var TreeGrid = function (element) {
		this.columns = [];
		this.childNodes = [];
		this.allNodes = [];

		this.data = null;
		this.depth = -1;
		this.grid = this;

		element.innerHTML = '<table class="table table-bordered table-striped"><thead><tr></tr></thead><tbody></tbody><table>';

		this.header = element.firstChild.tHead;
		this.tbody = element.firstChild.tBodies[0];

		this.selectedNode = null;
		this.itemRenderer = new TreeGridItemRenderer(this);
	};

	TreeGrid.prototype =  _.extend({
		loadColumns: function (columns) {
			if (this.header.rows.length > 0) {
				this.header.removeChild(this.header.rows[0]);
			}
			var tr = this.header.insertRow(0);

			var th = tr.insertCell(0);
			var checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			th.appendChild(checkbox);
			this.checkbox = checkbox;

			var that = this;
			checkbox.onclick = function () {
				for (var i = 0; i < that.allNodes.length; i++) {
					that.allNodes[i].checkbox.checked = checkbox.checked;
				}
			};

			for (var i = 0; i < columns.length; i++) {
				th = tr.insertCell(i + 1);
				th.innerHTML = columns[i].label;
			}
			this.columns = columns;

			this.initTemplate();
		},

		loadData: function (data) {
			for (var i = 0; i < data.length; i++) {
				this.addNode(data[i]);
			}

			//跟外面说一声，数据加载好了
			var event = {
				type: "loadCompleted",
				target: this
			};
			this.fire(event);
		},

		initTemplate: function () {
			var tr = document.createElement("tr");
			for (var i = 0; i <= this.columns.length; i++) {
				var td = document.createElement("td");
				tr.appendChild(td);
			}

			var checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			tr.firstChild.appendChild(checkbox);

			tr.childNodes[1].appendChild(document.createElement("span"));

			var icon = document.createElement("i");
			icon.className = "icon-folder-open";
			tr.childNodes[1].appendChild(icon);
			tr.childNodes[1].appendChild(document.createElement("span"));

			this.template = tr;
		},

		addNode: function (data, parent) {
			parent = parent || this;
			var node = new TreeNode(data, parent);
			parent.childNodes.push(node);
			this.allNodes.push(node);

			if (parent != this) {
				var loadedNodes = 0;
				for (var i = 0; i < parent.childNodes.length; i++) {
					if (parent.childNodes[i].domLoaded) {
						loadedNodes++;
					}
				}

				if (loadedNodes == 0) {
					parent.dom.insertAdjacentElement("afterEnd", node.dom);
				}
				else {
					parent.childNodes[loadedNodes - 1].dom.insertAdjacentElement("afterEnd", node.dom);
				}
			}
			else {
				this.tbody.appendChild(node.dom);
			}
			node.domLoaded = true;

			if (data.children) {
				for (var i = 0; i < data.children.length; i++) {
					this.addNode(data.children[i], node);
				}
				node.expanded = true;
			}

			var that = this;
			node.on("selected", function (event) {
				that.select(event.node);
			});

			//已经成功添加了新行
			var event = {
				type: "rowInserted",
				newNode: node,
				target: this
			};
			this.fire(event);
		},

		removeNode: function (node) {
			for (var i = node.childNodes.length - 1; i >= 0; i--) {
				this.removeNode(node.childNodes[i]);
			}

			this.tbody.removeChild(node.dom);

			for (var i = 0; i < node.parent.childNodes.length; i++) {
				if (node.parent.childNodes[i] == node) {
					node.parent.childNodes.splice(i, 1);
					break;
				}
			}

			for (var i = 0; i < this.allNodes.length; i++) {
				if (this.allNodes[i] == node) {
					this.allNodes.splice(i, 1);
					break;
				}
			}

			if (this.selectedNode == node) {
				this.selectedNode = null;
			}
			node.destroy();
		},

		select: function (node) {
			var event = {
				type: "changed",
				target: this,
				oldNode: this.selectedNode,
				newNode: node
			};

			if (this.selectedNode) {
				this.selectedNode.select(false);
			}

			if (node) {
				node.select(true);
			}

			this.selectedNode = node;

			this.fire(event);
		}
	}, Events);

	var TreeNode = function (data, parent) {
		this.data = data;
		this.depth = parent.depth + 1;
		this.parent = parent;
		this.grid = parent.grid;
		this.childNodes = [];
		this.domLoaded = false;

		this.create();
	};

	TreeNode.prototype =  _.extend({
		create: function () {
			var dom = this.grid.template.cloneNode(true);
			this.dom = dom;
			this.checkbox = this.dom.querySelector("tr>td>input");

			var that = this;
			this.checkbox.onclick = function () {
				that.check(that.checkbox.checked);
			};

			this.dom.querySelector("tr>td>i").onclick = function () {
				if (that.expanded) {
					that.collapse();
				}
				else {
					that.expand();
				}
			};

			var that = this;
			this.dom.onclick = function (event) {
				//通知上级，我被点了
				var newEvent = {
					type: "selected",
					target: that,
					node: that
				};
				that.fire(newEvent);
			};

			this.blankSpan = this.dom.childNodes[1].firstChild;

			this.blankSpan.style.marginLeft = this.depth * 20 + "px";
			this.dom.childNodes[1].lastChild.innerHTML = this.data[this.grid.columns[0].field];

			for (var i = 1; i < this.grid.columns.length; i++) {
				this.dom.childNodes[i + 1].innerHTML = this.grid.itemRenderer.render(this, this.data, i, this.grid.columns[i].field);
			}
		},

		destroy: function () {
			this.dom = null;
			this.data = null;
			this.grid = null;
		},

		addNode: function (data) {
			this.grid.addNode(data, this);
		},

		removeNode: function (node) {
			this.grid.removeNode(node);
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

		show: function () {
			this.dom.style.display = "";
			this.expand();
		},

		hide: function () {
			this.dom.style.display = "none";
			this.collapse();
		},

		expand: function () {
			for (var i = 0; i < this.childNodes.length; i++) {
				this.childNodes[i].show();
			}
			this.expanded = true;
		},

		collapse: function () {
			for (var i = 0; i < this.childNodes.length; i++) {
				this.childNodes[i].hide();
			}
			this.expanded = false;
		},

		check: function (flag) {
			this.checkbox.checked = flag;
			for (var i = 0; i < this.childNodes.length; i++) {
				this.childNodes[i].check(flag);
			}
		},

		get: function (key) {
			return this.data[key];
		},

		refresh: function (data) {
			this.data = data;

			this.dom.childNodes[1].lastChild.innerHTML = this.data[this.grid.columns[0].field];
			for (var i = 1; i < this.grid.columns.length; i++) {
				this.dom.childNodes[i + 1].innerHTML = this.grid.itemRenderer.render(this, data, i, this.grid.columns[i].field);
			}
		}
	}, Events);

	function TreeGridItemRenderer(grid) {
		this.grid = grid;
	}

	TreeGridItemRenderer.prototype = {
		render: function (node, rowData, columnIndex, key) {
			if (columnIndex == 0) {

			}
			else {
				return rowData[key] || "";
			}
		}
	};

	return TreeGrid;
});