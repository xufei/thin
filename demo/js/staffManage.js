
thin.define("StaffManage", ["DataGrid"], function(DataGrid) {
	var state = "View";

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

		setFormData(data);
	});

	grid.on("rowInserted", function(event) {
		event.target.select(event.newRow);
	});

	grid.on("rowRemoved", function(event) {
		if (event.target.rows.length > 0) {
			event.target.select(event.target.rows[0]);
		}
	});

	function init() {
		enableForm(false);
		switchButtons("Operate");

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

		grid.loadColumns(columns);
		grid.loadData(data);
	}


	//add event handler
	document.getElementById("newBtn").onclick = function() {
		state = "New";
		switchButtons("Confirm");
		enableForm(true);

		setFormData({});
	};

	document.getElementById("modifyBtn").onclick = function() {
		state = "Modify";
		switchButtons("Confirm");
		enableForm(true);
	}

	document.getElementById("deleteBtn").onclick = function() {
		if (confirm("Sure?")) {
			grid.removeRow(grid.selectedRow);
		}
	}

	document.getElementById("okBtn").onclick = function() {
		var data = getFormData();

		if (state === "New") {
			grid.insertRow(data);
		}
		else if (state === "Modify") {
			grid.selectedRow.refresh(data);
		}
		state = "View";
		switchButtons("Operate");
		enableForm(false);
	}

	document.getElementById("cancelBtn").onclick = function() {
		state = "View";
		switchButtons("Operate");
		enableForm(false);

		setFormData(grid.selectedRow.data);
	}

	function enableForm(flag) {
		document.getElementById("inputIndex").disabled = !flag;
		document.getElementById("inputName").disabled = !flag;
		document.getElementById("inputGender").disabled = !flag;
		document.getElementById("inputAge").disabled = !flag;
	}

	function switchButtons(group) {
		if (group === "Operate") {
			document.getElementById("operateBtns").style.display = "";
			document.getElementById("confirmBtns").style.display = "none";
		}
		else if (group === "Confirm") {
			document.getElementById("operateBtns").style.display = "none";
			document.getElementById("confirmBtns").style.display = "";
		}
	}

	function getFormData() {
		return {
			index: document.getElementById("inputIndex").value,
			name: document.getElementById("inputName").value,
			gender: document.getElementById("inputGender").value,
			age: document.getElementById("inputAge").value
		};
	}

	function setFormData(data) {
		document.getElementById("inputIndex").value = data.index || "";
		document.getElementById("inputName").value = data.name || "";
		document.getElementById("inputGender").value = data.gender || "";
		document.getElementById("inputAge").value = data.age || "";
	}

	return {
		init: init
	};
});