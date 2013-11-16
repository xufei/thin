thin.define("Workflow", ["WorkflowFactory"], function (WorkflowFactory) {
	var Workflow = function() {

	};

	Workflow.load = function(data) {
		var flow = WorkflowFactory.create(data.type);
		flow.load(data);
		return flow;
	};

	return Workflow;
});

thin.define("Workflow.Type", [], function() {
	return {
		"Sequential": "sequential",
		"StateMachine": "stateMachine"
	};
});

thin.define("WorkflowFactory", ["Workflow.Type", "SequentialFlow", "StateMachine"], function(types, SequentialFlow, StateMachine) {
	var WorkflowFactory = {
		create: function(type) {
			var flow;
			switch (type) {
				case types.Sequential: {
					flow = new SequentialFlow();
					break;
				}
				case types.StateMachine: {
					flow = new StateMachine();
					break;
				}
			}
			return flow;
		}
	};
});

thin.define("Activity", [], function () {
	var Activity = function() {
		this.name = "Activity";
		this.parent = null;
		this.root = null;
	};

	return Activity;
});

thin.define("CompositeActivity", ["Activity"], function(Activity) {
	var CompositeActivity = function() {
		Activity.call(this);
	};

	CompositeActivity.prototype = {

	}.extend(Activity);
});

thin.define("Transition", ["Condition"], function (Condition) {
	var Transition = function(data) {
		this.name = data.name || "Transition";
		this.condition = new Condition(data.condition);

		this.parent = null;
	};

	Transition.prototype = {
		evaluate: function() {
			if (!this.condition) {
				return true;
			}
			else {
				return this.condition.call(this.parent);
			}
		}
	};

	return Transition;
});

thin.define("Condition", [], function () {
	var Condition = function(expression) {
		this.expression = expression;
	};

	return Condition;
});

thin.define("SequentialFlow", ["CompositeActivity"], function (CompositeActivity) {
	function SequentialFlow() {

	}

	SequentialFlow.prototype = {
		clear: function () {

		},

		addActivity: function (data) {

		},

		addTransition: function (data, from, to) {

		}
	}.extend(Activity);

	return SequentialFlow;
});

thin.define("StateMachine", ["Activity", "CompositeActivity", "Transition"], function (Activity, CompositeActivity, Transition) {
	var State = Activity;

	var StateMachine = function() {
		CompositeActivity.call(this);

		this.name = "State Machine";
		this.states = {};
		this.transitions = [];

		this.startState = this.addState("Start");
		this.finishState = this.addState("Finish");

		this.currentState = this.startState;
	};

	StateMachine.prototype = {
		load: function(data) {
			for (var i=0; i<data.states.length; i++) {
				this.addState(data.states[i]);
			}
		},

		execute: function() {
			this.currentState.execute();

			for (var i=0; i<this.transitions.length; i++) {
				if (this.transitions[i].from == this.currentState) {
					if (this.transitions[i].evaluate()) {
						this.currentState = this.transitions[i].to;
						break;
					}
				}
			}
		},

		addState: function(name) {
			var state = new Activity(name);

			state.parent = this;
			this.states[name] = state;

			return state;
		},

		addTransition: function(data) {
			var transition = new Transition(data);

			transition.parent = this;
			this.transitions.push(transition);
			transition.from = this.states[data.from];
			transition.to = this.states[data.to];

			return transition;
		},

		isFinished: function() {
			return this.currentState == this.finishState;
		}
	}.extend(Activity);

	return StateMachine;
});
