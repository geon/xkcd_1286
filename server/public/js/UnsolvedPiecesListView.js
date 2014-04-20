
var UnsolvedPiecesListView = Backbone.View.extend({

	initialize: function() {

		this.app = this.options.app;
		this.template = $("#activity-template").text();

		this.collection.on("add", this.prependActivity, this);
		this.collection.on("reset", this.clearAll, this);
		
		// Keep the the latest activity duration updated.
		var self = this;
		var collection = this.collection;
		setInterval(function(){
	
			var lastActivity = _.last(collection.models);
			if (lastActivity) {
				lastActivity.view.updateDuration();
			}
			
			self.updateDurationSums()
		
		}, 1000);
	},

	prependActivity: function(model) {

		var activityElement = $(this.template);

		model.view = new ActivityView({
			el: activityElement,
			collection: this.collection,
			model: model,
			app: this.app
		});
		
		// Set up the view with the correct data.
		model.view.updateDOM(model);
		
		// Set up the label syncing manually since the plugin doesn't seem to work with dynamic elements.
		var keepInputLabelInSync = function toggleLabel() {
			var input = $(this);
				if (!input.val()) {
					input.prev("span").css("visibility", "");
				} else {
					input.prev("span").css("visibility", "hidden");
				}
		};
		var input = activityElement.find("input");
		keepInputLabelInSync.call(input);
		input.bind("keydown paste", keepInputLabelInSync);

		// Slide the new element down.
		activityElement.hide();
		this.$el.prepend(activityElement);
		activityElement.slideDown(function(){
			// Fade in the time label.
			$(this).find(".time").fadeIn(150);
		});

		// Remove the empty list text.		
		$("#no-activities").fadeOut();
				
		// Scroll the page to the top.
		$.smoothScroll(0);
	},
	
	clearAll: function () {
	
		this.$el.children().remove();
	},
	
	updateDurationSums: function () {
			
		this.updateDurationSumsOfType("work");
		this.updateDurationSumsOfType("break");
	},

	updateDurationSumsOfType: function (type) {
		
		// Sum up all durations.
		var sum = _.reduce(
			// Map out only the duration of each model.
			_.map(
				// Filter out only the models of the wanted type.
				_.filter(
					this.collection.models,
					function(model){ return model.get("type") == type; }
				),
				function(model){ return model.duration(); }
			),
			function(memo, num){ return memo + num; },
			0
		);
		
		var hours = Math.floor(sum/60);
		var minutes = sum%60;

		if (hours) {
			$("#"+type+"-duration-sum .hours").show();
		} else {
			$("#"+type+"-duration-sum .hours").hide();
		}

		$("#"+type+"-duration-sum .hours .number").text(hours);
		$("#"+type+"-duration-sum .minutes .number").text(minutes);
	}

});
