数据表格控件的渲染器
====

在第一部分中，我们讲述了如何实现一个最简单的数据表格控件，在这个部分，我们会讨论得深入一些，探讨数据表格的渲染器、排序等功能。

#5. 渲染器

什么叫做渲染器呢？

之前我们的DataGrid非常简单，每个单元格只是简单的把文本数据渲染出来，如果想要对这些文本作格式化处理，比如说，把性别的标记0和1转换成文字的“男”和“女”，要怎么去考虑？

有个笨办法，我们让用户传入数据之前，就把原始数据修改一下，比如说，原先数据格式是这样：

	{
		name: "Tom",
		age: 16,
		gender: 1
	}

我们给他先转换一遍，变成：

	{
		name: "Tom",
		age: 16,
		gender: 1,
		genderName: "Male"
	}

这样，不显示gender这个列，而是直接显示genderName这一列，也可以做到想要的效果。这么看上去简单方便，有没有什么弊端呢？有三种。

- 破坏了原始数据
- 需要对数据作预处理，这个处理过程比较集中，我们在前端常见的优化策略是把计算尽可能均摊，避免某个短时间的密集计算。
- 把逻辑割裂了。为什么这么说呢，因为你不但要在批量加载数据之前做这个转换，新增、修改行的时候，是不是也同时要？

另外也有个办法，可以预定义一些规则，比如说定义了这个是性别的列，把格式化的过程内置在控件中，这种做法也不好，内置的东西总是有限的，面对不断变更的需求，需要无休止地修改。

现在讨论的只是单个列需要处理，假如有多个，那更麻烦了，有没有什么更好的办法呢？

##5.1 字段格式化

我们可以把这个格式化功能提取到外面，然后注入进来。格式化的功能，至少应当是针对列的，所以可以附加到列的初始化信息里传递过来。考虑一下格式化函数的参数，至少需要原始值，但有些情况更加复杂，所以我们多给它一些信息，比如说，本行的完整数据，还有当前列的key值。这么一来，一个典型的格式化函数就有了：

	function labelFunction(data, key) {
		var value = data[key];
		if (value == 0) {
			return "Female";
		}
		else if (value == 1) {
			return "Male";
		}
		else {
			return "Unknown"
		}
	}


有了格式化，我们就可以很方便地进行一些显示的转换，比如对日需求，期、金额的实际值和显示值进行转换，或者，也可以显示一些图片和操作按钮之类。

比如说：

	function labelFunction(data, key) {
		var value = data[key];
		if (value > 18) {
			return "<button>Click me, man</button>";
		}
		else {
			return "Hi, boy, you can do nothing.";
		}	
	}

上面这段代码是一个示例，我们可以指定当年龄大于18岁的时候出来一个按钮可点，不足18的时候只出来一段文字。看上去，这段代码也满足我们需要了，但它将会遇到问题。

什么问题呢？我们来给这个按钮加个事件，点击它的时候，显示这个人的名字。考虑到我们输出的是HTML字符串，所以这个事件比较难加，除非也用字符串拼到里面，这么做是有很多弊端的，我们来考虑用一些优雅的方式解决。

##5.2 单元格渲染器

既然返回字符串不好，那我们直接一点，返回DOM结构如何？

	var itemRenderer = {
		render: function(data, key, columnIndex) {
			if (data[key] >= 18) {
				var btn = document.createElement("button");
				btn.innerHTML = data[key];
				btn.onclick = function() {
					alert("I am " + data[key] + " years old, I want a bottle of wine!");
				};

				return btn;
			}
			else {
				var span = document.createElement("span");
				span.innerHTML = data[key];
				return span;
			}
		},

		destroy: function() {
		}
	};

这样就好多了。这个时候，我们需要考虑渲染器和格式化函数的优先级，有人会问，有了渲染器，还要格式化函数干什么？这问题其实就像有了拖拉机，为什么锄头还能卖得出去？我们把渲染器当作一个比较重量级的解决方案，格式化函数当作轻量级的，各有其使用场景。

我们来看看行的渲染方法应当怎么写：

	render: function (cell, data, field, index) {
		if (this.grid.columns[index].itemRenderer) {
			cell.innerHTML = "";
			cell.appendChild(this.grid.columns[index].itemRenderer.render(data, field, index));
		}
		else if (this.grid.columns[index].labelFunction) {
			cell.innerHTML = "";
			cell.innerHTML = this.grid.columns[index].labelFunction(data, field);
		}
		else if (this.grid.itemRenderer) {
			cell.innerHTML = "";
			cell.appendChild(this.grid.itemRenderer.render(data, field, index));
		}
		else {
			cell.innerHTML = data[field];
		}
	}

这里面有四种东西：
- 针对某列的渲染器
- 针对某列的格式化函数
- 针对所有单元格的全局渲染器
- 直接赋值

我们让它们的优先级递减。为什么会同时需要全局渲染器和列的渲染器呢？其实也可以在全局渲染器里面对行、列作判断，然后分别为每种情况渲染，但如果很多列都需要渲染，这么做不太好，需要分离成多个不同的列渲染器。

注意到我们使用的渲染器里面带有destroy方法，这个是为了减少内存泄露而设计的，使用者可以自行在这里卸载事件处理函数，隔断待回收的对象引用。

现在我们实现了单元格的渲染器机制，那么，标题的列头呢？这里可能也会需要有定制的内容，所以也需要为它设计类似的扩展机制。

##5.3 数据表格的复选功能

有了这些渲染器机制，我们可以来为数据表格添加更实用的功能。很多数据表格的使用场景需要复选，标题上有一个复选框，可以控制行的选中状态，行的选中状态也会反过来影响到标题复选框的选中状态。

