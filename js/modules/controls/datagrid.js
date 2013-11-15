thin.define("DataGrid", ["_", "Events"], function (_, Events) {
	var DataGrid = function (element, config) {
		this.columns = [];
		this.rows = [];

		element.innerHTML = '<table class="table table-bordered table-striped"><thead><tr></tr></thead><tbody></tbody><table>';

		this.header = element.firstChild.tHead;
		this.tbody = element.firstChild.tBodies[0];

		this.selectedRow = null;

		this.config = config;
		this.variables = {};
	};

	DataGrid.prototype = _.extend({
		loadColumns: function (columns) {
			if (this.header.rows.length > 0) {
				this.header.removeChild(this.header.rows[0]);
			}
			var tr = this.header.insertRow(0);

			var width = 100 / columns.length;
			for (var i = 0; i < columns.length; i++) {
				var th = tr.insertCell(i);
				th.width = width + "%";
			}
			this.columns = columns;

			if (this.config && this.config.showCheckbox) {
				this.columns[0].headerRenderer = HeaderRenderer;
				this.columns[0].itemRenderer = CheckboxRenderer;
			}

			this.renderHeader();
		},

		loadData: function (data) {
			for (var i = 0; i < data.length; i++) {
				this.insertRow(data[i]);
			}

			this.renderHeader();

			var event = {
				type: "loadCompleted",
				target: this
			};
			this.fire(event);
		},

		insertRow: function (data) {
			var row = new DataRow(data, this);
			this.tbody.appendChild(row.dom);

			this.rows.push(row);

			var that = this;
			row.on("selected", function (event) {
				that.select(event.row);
			});

			var event = {
				type: "rowInserted",
				newRow: row,
				target: this
			};
			this.fire(event);
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

			var event = {
				type: "rowRemoved",
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
		},

		set: function (key, value) {
			this.variables[key] = value;
			this.renderHeader();
		},

		get: function (key) {
			return this.variables[key];
		},

		refresh: function () {
			this.renderHeader();
		},

		renderHeader: function () {
			var columns = this.columns;
			for (var i = 0; i < columns.length; i++) {
				var th = this.header.firstChild.childNodes[i];

				if (columns[i].headerRenderer) {
					th.innerHTML = "";
					th.appendChild(columns[i].headerRenderer.render(this, columns[i].field, i));
				}
				else if (this.headerRenderer) {
					th.innerHTML = "";
					th.appendChild(this.headerRenderer.render(this, columns[i].field, i));
				}
				else {
					th.innerHTML = columns[i].label;
				}
			}
		}
	}, Events);

	var DataRow = function (data, grid) {
		this.data = data;
		this.grid = grid;

		this.create();
	};

	DataRow.prototype = _.extend({
		create: function () {
			var row = document.createElement("tr");
			for (var i = 0; i < this.grid.columns.length; i++) {
				var cell = document.createElement("td");
				this.render(cell, this.data, this.grid.columns[i].field, i);
				row.appendChild(cell);
			}
			this.dom = row;

			var that = this;
			row.onclick = function (event) {
				var newEvent = {
					type: "selected",
					target: that,
					row: that
				};
				that.fire(newEvent);
			}
		},

		destroy: function () {
			//todo: 要把渲染器也destroy


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

			this.refresh();
		},

		get: function (key) {
			return this.data[key];
		},

		render: function (cell, data, field, index) {
			if (this.grid.columns[index].itemRenderer) {
				cell.innerHTML = "";
				cell.appendChild(this.grid.columns[index].itemRenderer.render(this, field, index));
			}
			else if (this.grid.columns[index].labelFunction) {
				cell.innerHTML = "";
				cell.innerHTML = this.grid.columns[index].labelFunction(data, field);
			}
			else if (this.grid.itemRenderer) {
				cell.innerHTML = "";
				cell.appendChild(this.grid.itemRenderer.render(this, field, index));
			}
			else {
				cell.innerHTML = data[field];
			}
		},

		refresh: function (data) {
			if (data) {
				this.data = data;
			}

			for (var i = 0; i < this.grid.columns.length; i++) {
				this.render(this.dom.childNodes[i], this.data, this.grid.columns[i].field, i);
			}
		}
	}, Events);

	var CheckboxRenderer = {
		render: function (row, field, columnIndex) {
			var grid = row.grid;
			var data = row.data;

			var div = document.createElement("div");
			var checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			checkbox.checked = data["checked"];

			checkbox.onclick = function () {
				data["checked"] = !data["checked"];

				var checkedItems = 0;
				var rowLength = grid.rows.length;
				for (var i = 0; i < rowLength; i++) {
					if (grid.rows[i].get("checked")) {
						checkedItems++;
					}
				}

				if (checkedItems === 0) {
					grid.set("checkState", "unchecked");
				}
				else if (checkedItems === rowLength) {
					grid.set("checkState", "checked");
				}
				else {
					grid.set("checkState", "indeterminate");
				}
			};
			div.appendChild(checkbox);

			var span = document.createElement("span");
			span.innerHTML = data[field];
			div.appendChild(span);

			return div;
		}
	};

	var HeaderRenderer = {
		render: function (grid, field, columnIndex) {
			var rows = grid.rows;
			var div = document.createElement("div");
			var checkbox = document.createElement("input");
			checkbox.type = "checkbox";

			switch (grid.get("checkState")) {
				case "checked":
				{
					checkbox.checked = true;
					break;
				}
				case "unchecked":
				{
					checkbox.checked = false;
					break;
				}
				case "indeterminate":
				{
					checkbox.indeterminate = true;
					break;
				}
			}
			div.appendChild(checkbox);

			checkbox.onclick = function () {
				var checked = this.checked;
				for (var i = 0; i < rows.length; i++) {
					rows[i].set("checked", checked);
				}
			};

			var span = document.createElement("span");
			span.innerHTML = field;
			div.appendChild(span);

			return div;
		},

		destroy: function () {

		}
	};

	return DataGrid;
});