thin.define("OrgViewModel", ["TreeGrid"], function (TreeGrid) {
	function OrgViewModel() {
		this.state = "View";
		this.enableForm = false;
		this.editing = false;

		this.genderArr = [
			{
				key: "0",
				label: "Female"
			},
			{
				key: "1",
				label: "Male"
			}
		];
	}

	OrgViewModel.prototype = {
		init: function () {
			var that = this;

			var grid = new TreeGrid(this.orgGrid);

			grid.on("loadCompleted", function (event) {
				if (event.target.childNodes.length > 0) {
					event.target.select(event.target.childNodes[0]);
				}
			});

			grid.on("changed", function (event) {
				var data;
				if (event.newNode) {
					data = event.newNode.data;
				}
				else {
					data = {};
				}

				that.setFormData(data);
			});

			grid.on("rowInserted", function (event) {
				event.target.select(event.newRow);
			});

			grid.on("rowRemoved", function (event) {
				if (event.target.rows.length > 0) {
					event.target.select(event.target.rows[0]);
				}
			});

			this.grid = grid;

			var columns = [
				{
					label: "Name",
					field: "name"
				},
				{
					label: "Code",
					field: "code"
				}
			];

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
					code: "fj",
					children: [
						{
							name: "Fuzhou",
							code: "fz"
						},
						{
							name: "Xiamen",
							code: "xm"
						}
					]
				}
			];

			this.grid.loadColumns(columns);
			this.grid.loadData(data);
		},

		newClick: function () {
			this.state = "New";
			this.editing = true;
			this.enableForm = true;

			this.setFormData({});
		},

		modifyClick: function () {
			this.state = "Modify";
			this.editing = true;
			this.enableForm = true;
		},

		deleteClick: function () {
			if (confirm("Sure?")) {
				this.grid.removeNode(this.grid.selectedNode);
			}
		},

		okClick: function () {
			var data = this.getFormData();

			if (this.state === "New") {
				this.grid.addNode(data, this.grid.selectedNode);
			}
			else if (this.state === "Modify") {
				this.grid.selectedNode.refresh(data);
			}
			this.state = "View";
			this.editing = false;
			this.enableForm = false;
		},

		cancelClick: function () {
			this.state = "View";
			this.editing = false;
			this.enableForm = false;

			this.setFormData(this.grid.selectedNode.data);
		},

		getFormData: function () {
			return {
				name: this.name,
				code: this.code
			};
		},

		setFormData: function (data) {
			this.name = data.name;
			this.code = data.code;
		}
	};

	return OrgViewModel;
});