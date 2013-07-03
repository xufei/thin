
thin.define("StaffViewModel", ["DataGrid"], function(DataGrid, vm) {
	function StaffViewModel() {
		this.state = "View";

		var that = this;

		var grid = new DataGrid(document.getElementById("grid1"));

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
		this.init();
	}

	StaffViewModel.prototype = {
		init: function() {
			this.enableForm = false;
			this.switchButtons("Operate");

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
			this.switchButtons("Confirm");
			this.enableForm = true;

			this.setFormData({});
		},

		modifyClick: function() {
			this.state = "Modify";
			this.switchButtons("Confirm");
			this.enableForm = true;
		},

		deleteClick: function() {
			if (confirm("Sure?")) {
				this.grid.removeRow(grid.selectedRow);
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
			this.switchButtons("Operate");
			this.enableForm = false;
		},

		cancelClick: function() {
			this.state = "View";
			this.switchButtons("Operate");
			this.enableForm = false;

			this.setFormData(grid.selectedRow.data);
		},

		switchButtons: function(group) {
			if (group === "Operate") {
				document.getElementById("operateBtns").style.display = "";
				document.getElementById("confirmBtns").style.display = "none";
			}
			else if (group === "Confirm") {
				document.getElementById("operateBtns").style.display = "none";
				document.getElementById("confirmBtns").style.display = "";
			}
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
			this.extend(data);
		}
	};

	return StaffViewModel;
});