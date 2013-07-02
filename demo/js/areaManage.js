thin.define("AreaManage", ["Tree"], function(Tree) {

	var state = "View";

	var tree = new Tree(document.getElementById("tree1"));

	tree.on("changed", function (event) {
		var data;
		if (event.newNode) {
			data = event.newNode.data;
		}
		else {
			data = {};
		}

		setFormData(data);
	});

	function init() {
		enableForm(false);
		switchButtons("Operate");

		var data = [
			{
				name: "Jiangsu",
				code: "js",
				children: [
					{
						name: "Nanjing",
						code: "nj"
					},
					{
						name: "Suzhou",
						code: "sz",
						children: [
							{
								name: "Wujiang",
								code: "wj"
							},
							{
								name: "Changshu",
								code: "cs"
							}
						]
					}
				]
			},
			{
				name: "Yunnan",
				code: "yn"
			},
			{
				name: "Fujian",
				code: "fj"
			}
		];

		tree.labelField = "name";
		tree.loadTreeData(data);
	}

	document.getElementById("newBtn").onclick = function() {
		state = "New";
		switchButtons("Confirm");
		enableForm(true);

		setFormData({});
	}

	document.getElementById("modifyBtn").onclick = function() {
		state = "Modify";
		switchButtons("Confirm");
		enableForm(true);
	}

	document.getElementById("deleteBtn").onclick = function() {
		if (confirm("Sure?")) {
			tree.removeNode(tree.selectedNode);
		}
	}

	document.getElementById("okBtn").onclick = function() {
		var data = getFormData();

		if (state === "New") {
			tree.addNode(data, tree.selectedNode);
		}
		else if (state === "Modify") {
			tree.selectedNode.refreshData(data);
		}
		state = "View";
		switchButtons("Operate");
		enableForm(false);
	}

	document.getElementById("cancelBtn").onclick = function() {
		state = "View";
		switchButtons("Operate");
		enableForm(false);

		setFormData(tree.selectedItem.data);
	}

	function enableForm(flag) {
		document.getElementById("inputName").disabled = !flag;
		document.getElementById("inputCode").disabled = !flag;
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
			name: document.getElementById("inputName").value,
			code: document.getElementById("inputCode").value
		};
	}

	function setFormData(data) {
		document.getElementById("inputName").value = data.name || "";
		document.getElementById("inputCode").value = data.code || "";
	}

	return {
		init: init
	};
});
