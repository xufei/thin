
thin.define("StaffViewModel", ["DataGrid"], function(DataGrid, vm) {
	function StaffViewModel() {
	}

	StaffViewModel.prototype = {
		init: function() {
			var that = this;

			var grid = new DataGrid(this.staffGrid);

			grid.on("loadCompleted", function(event) {
				if (event.target.rows.length > 0) {
					event.target.select(event.target.rows[0]);
				}
			});

			grid.on("changed", function(event) {
				var data;
				if (event.newRow) {
					data = event.newRow.data;
				}
				else {
					data = {};
				}

				that.setFormData(data);
			});

			grid.on("rowInserted", function(event) {
				event.target.select(event.newRow);
			});

			grid.on("rowRemoved", function(event) {
				if (event.target.rows.length > 0) {
					event.target.select(event.target.rows[0]);
				}
			});

			this.grid = grid;
			this.state = "View";
			this.enableForm = false;
			this.editing = false;

			var columns = [{
				label: "#",
				field: "index"
			}, {
				label: "Name",
				field: "name"
			}, {
				label: "Gender",
				field: "gender"
			}, {
				label: "Age",
				field: "age"
			}];

			var data = [{
				index: 1,
				name: "Tom",
				gender: "Male",
				age: 5
			}, {
				index: 2,
				name: "Jerry",
				gender: "Female",
				age: 2
			}, {
				index: 3,
				name: "Sun Wukong",
				gender: "Male",
				age: 1024
			}];

			this.grid.loadColumns(columns);
			this.grid.loadData(data);
		},

		newClick: function() {
			this.state = "New";
			this.editing = true;
			this.enableForm = true;

			this.setFormData({});
		},

		modifyClick: function() {
			this.state = "Modify";
			this.editing = true;
			this.enableForm = true;
		},

		deleteClick: function() {
			if (confirm("Sure?")) {
				this.grid.removeRow(this.grid.selectedRow);
			}
		},

		okClick: function() {
			var data = this.getFormData();

			if (this.state === "New") {
				this.grid.insertRow(data);
			}
			else if (this.state === "Modify") {
				this.grid.selectedRow.refresh(data);
			}
			this.state = "View";
			this.editing = false;
			this.enableForm = false;
		},

		cancelClick: function() {
			this.state = "View";
			this.editing = false;
			this.enableForm = false;

			this.setFormData(this.grid.selectedRow.data);
		},

		getFormData: function() {
			return {
				index: this.index,
				name: this.name,
				gender: this.gender,
				age: this.age
			};
		},

		setFormData: function(data) {
			this.index = data.index;
			this.name = data.name;
			this.gender = data.gender;
			this.age = data.age;
		}
	};

	return StaffViewModel;
});