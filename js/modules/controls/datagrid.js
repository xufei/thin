thin.define("DataGrid", ["Observer"], function (Observer) {
	var DataGrid = function (element, config) {
		this.columns = [];
		this.rows = [];

		element.innerHTML = '<table class="table table-bordered table-striped"><thead><tr></tr></thead><tbody></tbody><table>';

		this.header = element.firstChild.tHead;
		this.tbody = element.firstChild.tBodies[0];

		this.selectedRow = null;

		if (config && config.showCheckbox) {
			this.itemRenderer = CheckboxRenderer;
			this.headerRenderer = HeaderRenderer;
		}
	}

	DataGrid.prototype = {
		loadColumns: function (columns) {
			if (this.header.rows.length > 0) {
				this.header.removeChild(this.header.rows[0]);
			}
			var tr = this.header.insertRow(0);

			for (var i = 0; i < columns.length; i++) {
				var th = tr.insertCell(i);

				if (columns[i].headerRenderer) {
					th.appendChild(columns[i].headerRenderer(columns[i].field, i));
				}
				else if (this.headerRenderer) {
					th.appendChild(this.headerRenderer(columns[i].field, i));
				}
				else {
					th.innerHTML = columns[i].label;
				}
			}
			this.columns = columns;
		},

		loadData: function (data) {
			for (var i = 0; i < data.length; i++) {
				this.insertRow(data[i]);
			}

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
		}
	}.extend(Observer);

	var DataRow = function (data, grid) {
		this.data = data;
		this.grid = grid;

		this.create();
	};

	DataRow.prototype = {
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

		render: function(cell, data, field, index) {
			if (this.grid.columns[index].itemRenderer) {
				cell.innerHTML = "";
				cell.appendChild(this.grid.columns[index].itemRenderer(data, field, index));
			}
			else if (this.grid.columns[index].labelFunction) {
				cell.innerHTML = "";
				cell.innerHTML = this.grid.columns[index].labelFunction(data, field);
			}
			else if (this.grid.itemRenderer) {
				cell.innerHTML = "";
				cell.appendChild(this.grid.itemRenderer(data, field, index));
			}
			else {
				cell.innerHTML = data[field];
			}
		},

		refresh: function (data) {
			this.data = data;

			for (var i = 0; i < this.grid.columns.length; i++) {
				this.render(this.dom.childNodes[i], data, this.grid.columns[i].field, i);
			}
		}
	}.extend(Observer);

	function CheckboxRenderer(data, key, columnIndex) {
		if (columnIndex == 0) {
			var div = document.createElement("div");
			var checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			checkbox.checked = data["checked"];

			checkbox.onclick = function() {
				data["checked"] = !data["checked"];
			};
			div.appendChild(checkbox);

			var span = document.createElement("span");
			span.innerHTML = data[key];
			div.appendChild(span);

			return div;
		}
		else {
			var span = document.createElement("span");
			span.innerHTML = data[key];
			return span;
		}
	}

	function HeaderRenderer(field, columnIndex) {
		if (columnIndex == 0) {
			var div = document.createElement("div");
			var checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			div.appendChild(checkbox);

			checkbox.onclick = function() {

			};

			var span = document.createElement("span");
			span.innerHTML = field;
			div.appendChild(span);

			return div;
		}
		else {
			var span = document.createElement("span");
			span.innerHTML = field;
			return span;
		}
	}

	return DataGrid;
});