数据表格控件的基础功能
====

数据表格是一个很常用的控件，用于把多列数据展示成表格的形状，通常有表头，表头可固定，表格内容可滚动。本文以一个数据表格控件为例，说明从构思到实现控件的整个过程。

为了使初学者更容易理解其中的原理，我们不使用任何额外的库，比如jQuery之类，仅仅使用bootstrap来控制样式。

#1. 功能分析

DataGrid控件主要有以下几个功能：
- 加载数据并展示成表格的形状
- 新增一行
- 删除一行
- 点击某行选中
- 修改行数据并刷新

DataGrid控件主要需要响应这样几个事件：
- 加载完成
- 选中行变更

#2. 实现原理

想要实现DataGrid控件，我们有三个步骤要做：

- 用什么样的DOM结构来展现
- 用什么样的结构来定义数据
- 数据跟DOM结构如何关联起来

下面我们来考虑如何分别实现这三个步骤。

##2.1. DOM结构

做一个控件之前，我们首先要把DOM结构确定下来，也就是用HTML能够展现控件的形态。什么结构适合展现数据表格呢？毫无疑问，是HTML中的table，语义上非常符合，为了省事，我们不考虑样式，直接用bootstrap中的表格样式。

    <table class="table table-bordered table-striped">
        <thead>
            <tr>
                <th>#</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Age</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>1</td>
                <td>Tom</td>
                <td>Male</td>
                <td>5</td>
            </tr>
            <tr>
                <td>2</td>
                <td>Jerry</td>
                <td>Female</td>
                <td>2</td>
            </tr>
            <tr>
                <td>3</td>
                <td>Sun Wukong</td>
                <td>Male</td>
                <td>1024</td>
            </tr>
        </tbody>
    </table>

这个结构足够表达DataGrid了，样子也还可以，所以我们很满意，开始考虑数据了。单使用这个结构，是难以做到表头固定，表格体可滚动的，但为了简单，我们先用这个结构来做。

##2.2. 数据结构

在数据表格中，有两个数据是需要传入的，一是标题的列头数据，二是表格的内容，它们都很适合用数组来描述。

列头最少需要描述这些内容：
标题
数据字段

表格行需要有这些信息：
每个key的值

所以，对照上面的表格，我们可以把数据描述起来：

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

##2.3. DOM和数据的关联

这部分听起来有些复杂，我先打个比方吧。

有一个勤劳的妈妈，她有三个宝宝，每个宝宝都有不少衣物，妈妈的职责是管理这些衣物，并且用它们来装扮宝宝们。这些衣物可以分为上衣，裤子，鞋子，袜子，帽子等等。

想象一下她是怎么做的：
把第一个宝宝抱过来，选几件衣服，给他穿上，放他出去玩。
对第二个宝宝做同样的操作。
对第三个宝宝做同样的操作。

我们甚至还可以推而广之，不管她有多少宝宝，都必定是按照这个方式做的。

那么，对比我们的控件，每条数据都是一个宝宝，把数据渲染到DOM的过程就好比给宝宝穿衣服。我们的列信息就好比衣物的分类。

我们有另外的问题：
宝宝们都出去玩了，我们问妈妈：最大的宝宝穿的是些什么衣服？绿色有大嘴猴的那件T恤穿在哪个宝宝身上？

这就要求妈妈对衣服和宝宝的关联关系有所记录。拿我们这个控件来看，宝宝就相当于每行的数据，衣服相当于用来展示的DOM节点，在这两者之间是需要一些关联的。

#3. 程序设计

##3.1. 实体划分

在我们这个控件中，存在两个实体：数据表格，表格行。

数据表格的职责很清楚，表格行的存在又是为了什么呢？我们完全可以把职责全部掌控在数据表格里，不下放给行。

设想我们要取选中行的name属性，我们的写法是这样的：

    var row = grid.selectedRow();
    var name = grid.get(row, "name");

希望这么写：

    var row = grid.selectedRow();
    var name = row.get("name");

甚至我们可以连着写：

    var name = grid.selectedRow().get("name");

这里的问题是，selectedRow究竟要返回什么结构，才能让它有get方法？

这里有两种选择，一种是返回行的DOM结构，get方法附加在行上，行的数据也作为属性附加在DOM上，这样我们是没有单独的表格行实体的。另一种是创建表格行的实体，在其中管理DOM和数据的关联关系。这两种方式，我们应当如何选择呢？

把过多数据附加到DOM上并不是一个好的选择，尤其我们不能确定用户给控件传哪些字段，万一跟DOM自身的冲突了，会很糟糕。所以我们选择自己来管理这个关系。

##3.2. 表格行的职责

确定了这样的原则之后，我们来考虑表格行的职责。

表格行，它应当可以被选中，也可以被取消选中（这个操作不是通过点击选中状态的自身来完成，而是点击其他行，由表格控件来取消自己的选中），可以读写数据。

我们考虑一下表格行的选中要干些什么。首先，如果已经有选中的行了，要把那个的样式去掉，然后把选中的行指向当前的行，再把当前行的样式变成选中的颜色。

这些职责，我们来考虑一下，哪些属于表格，那些数据表格行。

表格行是否应当知道所在表格当前选中的行是谁？不应该，因为这跟你无关。你只要知道自己是不是被选中就行了，不要管闲事。所以，管理选中行这个事情应当给表格做，某行被点击了，他不该擅自作决定，比如先把自己颜色变掉之类的，而是应当先请示汇报：“老大，有人翻我牌子，你把我选起来吧。”

严格来说，小弟不该干涉老大的工作，比如老大这时候就应该扇他一巴掌：“扑街仔，翻你牌几啦？不把老大放眼里啦？机不机到德墨忒尔法则啦？”然后还是把他选中。问题出在哪里呢？你多嘴了。你告诉老大，有人点我就可以了，你管老大后面干什么？那是他的事，虽然你知道老大要这么干，但你这个属于知道得太多，该打。

好了，现在老大知道有人翻你牌子了，拿了个本子翻了翻，把今天的头牌改成了你，然后分别对新老两个头牌大喝一声：“浩南把你的表拿下来，山鸡戴上！”看到没有，小弟听到老大指示之后才能改变外观。

山鸡去台湾作出一番事业，从前人家叫他山鸡，回来之后，有人还想这么叫，浩南哥语重心长地纠正：“叫鸡哥！”从此大家都叫他鸡哥了。

综上所述，表格行有这几个职责：

- 创建，做一些初始化的事情
- 销毁，主要是行呗删除的时候把DOM和数据的引用去掉，这样浏览器可以做内存回收
- 选中，改变样式为选中状态，比如山鸡戴上了三个表，从此成为了代表
- 取消选中，改变样式为非选中状态，比如浩南把自己的表给了山鸡，自己就不是代表了
- 设置属性，比如浩南把山鸡的称呼改成鸡哥
- 获取属性，比如别人看到山鸡，打听一下就知道他是鸡哥

##3.3. 表格的职责

在上面所有功能里去掉表格行的职责，就得到了表格的职责

- 加载列头数据
- 根据数据加载列表
- 添加行
- 删除行
- 选中行

##3.4. 如何实现自定义事件

什么是事件呢？本质上是一种异步的机制，打个比方说，你委托我做饭，说，做完饭给你打个电话，你先出去玩了。为什么是异步呢，因为你不在这里等我做完就走了，你也不关心我什么时候做得完，反正做好告诉你就是了。你在我这里监听了做饭完成事件，我做完之后，把这个事件派发一下，派发到你了，我的职责就完成了。

这么一看，我们的事情其实不复杂。我要对你提供什么呢：

- 添加事件的监听，注意这里可能不止一个，有可能多个人同时来等着吃饭。
- 移除事件的监听，这是为何？因为可能我没做完，你先给我打了电话，说别人约你吃饭，你不需要知道我是否做完了。
- 当事情做完，通知所有监听方。

这些分析完，我们的代码就好写了：

    //事件派发机制的实现
    var EventDispatcher = {
        addEventListener: function(eventType, handler) {
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

        removeEventListener: function(eventType, handler) {
            for (var i=0; i<this.eventMap[eventType].length; i++) {
                if (this.eventMap[eventType][i] === handler) {
                    this.eventMap[eventType].splice(i, 1);
                    break;
                }
            }
        },

        dispatchEvent: function(event) {
            var eventType = event.type;
            for (var i=0; i<this.eventMap[eventType].length; i++) {
                //把对当前事件添加的处理函数拿出来挨个执行
                this.eventMap[eventType][i](event);
            }
        }
    };

除此之外，我们还需要写一个辅助方法，用于把事件机制附加到表格上：

    //简单的对象属性复制，把源对象上的属性复制到自己身上，只复制一层
    Object.prototype.extend = function(base) {
        for (var key in base) {
            if (base.hasOwnProperty(key)) {
                this[key] = base[key];
            }
        }
        return this;
    };

#4. 基础功能的实现

我们把前面这两段代码放置在一个util.js中，因为这些功能不仅仅在DataGrid中会用到，然后，再创建一个datagrid.js，内容如下：

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

然后，我们为它创建一个测试页面，叫做datagrid.html，内容如下：

	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="utf-8">
		<title>DataGrid</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content="DataGrid">
		<meta name="author" content="xu.fei@outlook.com">

		<link href="http://twitter.github.io/bootstrap/assets/css/bootstrap.css" rel="stylesheet"/>
		<script type="text/javascript" src="js/utils.js"></script>
		<script type="text/javascript" src="js/datagrid1.js"></script>
	</head>
	<body>
		<div class="span12">
			<div class="header">
				<h3>Staff Management</h3>
			</div>
			<div>
				<div id="grid1" class="row"></div>
				<div class="row">
					<div class="header">
						<h4>Detail</h4>
					</div>
					<hr/>
					<form class="form-horizontal span6">
						<div class="control-group">
							<label class="control-label" for="inputIndex">Index</label>
							<div class="controls">
								<input type="text" id="inputIndex" placeholder="Index">
							</div>
						</div>
						<div class="control-group">
							<label class="control-label" for="inputGender">Gender</label>
							<div class="controls">
								<input type="text" id="inputGender" placeholder="Gender">
							</div>
						</div>
					</form>
					<form class="form-horizontal span6">
						<div class="control-group">
							<label class="control-label" for="inputName">Name</label>
							<div class="controls">
								<input type="text" id="inputName" placeholder="Name">
							</div>
						</div>
						<div class="control-group">
							<label class="control-label" for="inputAge">Age</label>
							<div class="controls">
								<input type="text" id="inputAge" placeholder="age">
							</div>
						</div>
					</form>
				</div>
			</div>
			<div class="modal-footer">
				<div id="operateBtns">
					<button class="btn btn-primary" onclick="newClicked()">New</button>
					<button class="btn btn-primary" onclick="modifyClicked()"><i class="icon-edit icon-white"></i>Modify</button>
					<button class="btn btn-primary" onclick="deleteClicked()"><i class="icon-remove icon-white"></i>Delete</button>
				</div>
				<div id="confirmBtns">
					<button class="btn btn-primary" onclick="okClicked()"><i class="icon-ok icon-white"></i>OK</button>
					<button class="btn btn-primary" onclick="cancelClicked()">Cancel</button>
				</div>
			</div>
		</div>

		<script type="text/javascript">
		var state = "View";

		var grid = new DataGrid(document.getElementById("grid1"));

		grid.addEventListener("loadCompleted", function(event) {
			if (event.target.rows.length > 0) {
				event.target.select(event.target.rows[0]);
			}
		});

		grid.addEventListener("changed", function(event) {
			var data;
			if (event.newRow) {
				data = event.newRow.data;
			}
			else {
				data = {};
			}

			setFormData(data);
		});

		grid.addEventListener("rowInserted", function(event) {
			event.target.select(event.newRow);
		});

		grid.addEventListener("rowRemoved", function(event) {
			if (event.target.rows.length > 0) {
				event.target.select(event.target.rows[0]);
			}
		});

		init();

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

		function newClicked() {
			state = "New";
			switchButtons("Confirm");
			enableForm(true);

			setFormData({});
		}

		function modifyClicked() {
			state = "Modify";
			switchButtons("Confirm");
			enableForm(true);
		}

		function deleteClicked() {
			if (confirm("Sure?")) {
				grid.removeRow(grid.selectedRow);
			}
		}

		function okClicked() {
			var data = {
				index: document.getElementById("inputIndex").value,
				name: document.getElementById("inputName").value,
				gender: document.getElementById("inputGender").value,
				age: document.getElementById("inputAge").value
			};

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

		function cancelClicked() {
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
		</script>
	</body>
	</html>

我们可以看到，这已经可以跑一个简单的维护界面了，但我们的功能还是有限的，在后续篇幅中，我们会讲述如何实现表格的渲染器、改变列的宽度，固定列头，表格体滚动，排序等高级功能。我们的最终目标是：一个很正式的DataGrid控件。