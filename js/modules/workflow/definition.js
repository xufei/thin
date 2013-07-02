
thin.define("Workflow", [], function() {

});

thin.define("Activity", [], function() {
	function Activity(data) {

	}

	return Activity;
});


thin.define("Transition", ["Condition"], function(Condition) {
	function Transition(data) {
		this.condition = new Condition();
	}

	return Transition;
});

thin.define("Condition", [], function() {
	function Condition(expression) {
		this.expression = expression;
	}

	return Condition;
});

thin.define("SequentialFlow", ["Activity"], function(Activity) {
	function SequentialFlow() {

	}

	SequentialFlow.prototype = {
		load: function(data) {

		},

		clear: function() {

		},

		addActivity: function(data) {

		},

		addTransition: function(data, from, to) {

		}
	};

	return SequentialFlow;
});

thin.define("StateMachine", ["Activity", "Transition"], function(Activity, Transition) {

	function StateMachine() {
		this.activities = [];
		this.transitions = [];

		this.currentActivity = null;

	}

	StateMachine.prototype = {
		load: function(data) {

		},

		clear: function() {
			this.activities = [];
			this.transitions = [];

			this.currentActivity = null;
		},

		addActivity: function(data) {
			var activity = new Activity(data);
			activity.flow = this;

			this.activities.push(activity);
		},

		addTransition: function(data, from, to) {
			var transition = new Transition(data);
			transition.from = from;
			transition.to = to;
			transition.flow = this;

			this.transitions.push(transition);
		}
	}

	return StateMachine;
});