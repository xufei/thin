
thin.define("IDEService", ["ArrayCollection"], function() {
	var ToolbarModel = new ArrayCollection();

	var models = {
		toolbar: ToolbarModel
	};

	var IDEService = {
		getModel: function(modelName) {
			return models[modelName];
		}
	};

	return IDEService;
});