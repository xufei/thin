thin.define("TreeGrid", ["Observer"], function (Observer) {
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

		this.selectedItem = null;
	};

	TreeGrid.prototype = {
		loadColumns: function (columns) {
			if (this.header.rows.length > 0) {
				this.header.removeChild(this.header.rows[0]);
			}
			var tr = this.header.insertRow(0);

			var th = tr.insertCell(0);
			var checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			th.appendChild(checkbox);

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

		initTemplate: function() {
			var template = '<tr><td><input type="checkbox"/></td>'
				+ '<td><span style="margin-left: <%= 20*depth %>px"></span><i class="icon-inbox"></i><%= first %></td>'
				+ '<% _.each(dataArr, function(item) { %> <td><%= item %></td> <% }); %></tr>';
			this.template = _.template(template);
		},

		addNode: function(data, parent) {
			parent = parent || this;
			var node = new TreeNode(data, parent);;
			parent.childNodes.push(node);
			this.allNodes.push(node);

			var that = this;
			node.on("selected", function (event) {
				that.select(event.row);
			});

			//已经成功添加了新行
			var event = {
				type: "rowInserted",
				newNode: node,
				target: this
			};
			this.fire(event);
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

			this.fire(event);
		}
	}.extend(Observer);

	var TreeNode = function (data, parent) {
		this.data = data;
		this.depth = parent.depth + 1;
		this.parent = parent;
		this.grid = parent.grid;
		this.childNodes = [];

		this.create();
	}

	TreeNode.prototype = {
		create: function () {
			var dataArr = [];
			for (var i = 1; i < this.grid.columns.length; i++) {
				dataArr[i] = this.data[this.grid.columns[i].field];
			}

			var str = this.grid.template({depth:this.depth, first:this.data[this.grid.columns[0].field], dataArr:dataArr});
			this.grid.tbody.innerHTML += str;

			if (this.data.children) {
				for (var i = 0; i < this.data.children.length; i++) {
					this.addNode(this.data.children[i]);
				}
			}

			//this.checkbox = checkbox;

			/*
			for (var i = 0; i < this.grid.columns.length; i++) {
				cell = document.createElement("td");
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
				that.fire(newEvent);
			}
			*/
		},

		destroy: function () {
			this.dom = null;
			this.data = null;
			this.grid = null;
		},

		addNode: function (data) {
			this.grid.addNode(data, this);
		},

		select: function (flag) {
			if (flag) {
				//this.dom.className = "info";
			}
			else {
				//this.dom.className = "";
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
	}.extend(Observer);

	return TreeGrid;
});