
thin.define("ToolbarVM", ["IDEService"], function(IDEService) {
	var model = IDEService.getModel("toolbar");

	model.itemUpdated();
});