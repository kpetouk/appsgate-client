define([
	"jquery",
	"underscore",
	"backbone",
	"raphael",
	"text!templates/map/default.html"
], function($, _, Backbone, Raphael, mapDefaultTemplate) {
	// initialize the module
	var Map = {};

	// router
	Map.Router = Backbone.Router.extend({
		routes: {
			"map"		: "map"
		},

		// show the map
		map:function() {
			var defaultView = new Map.Views.Default();
			defaultView.render();
		}
	});


	// views
	Map.Views = {};

	// default view, shows the global map
	Map.Views.Default = Backbone.View.extend({
		el: $("#appsgate"),
		tagName: "article",
		className: "map-container",
		template: _.template(mapDefaultTemplate),

		/**
		 * @constructor
		 */
		initialize:function() {
			// bind the window resize event
			$(window).resize(_.bind(this.onresize, this));

			// instantiate the raphaeljs canvas
			this.paper = Raphael(0, $("#appsgate").position().top,
					$(document).width(),
					$(document).height() - $("#appsgate").position().top);

			// instantiate the set for the grid
			this.element = this.paper.set();

			// initialize the graphical properties of the grid
			this.nbTiles = 100;
			this.tileSize = 100;
			this.innerGapSize = 10;
			this.outerGapSize = 10;
			
			// render the default template for the title, etc.
			this.$el.html(this.template());

			// set the cache jquery element to be the raphael element
			this.setElement(this.element.node);

			this.delegateEvents(this.events);

			// compute the initial layout
			this.computeTilesLayout();
		},

		/**
		 * Compute the layout of the tiles according to the size of the window
		 *
		 * @method computeTilesLayout
		 */
		computeTilesLayout:function() {
			var width = $(window).width();

			// compute the number of tiles on a line, on a column and the size
			// of the gaps surrounding the grid
			var nbTileLine = (width - 2 * this.outerGapSize + this.innerGapSize)
					/ (this.tileSize + this.innerGapSize);
			var finalOuterGapSize = this.outerGapSize +
					((nbTileLine - Math.floor(nbTileLine)) * this.tileSize) / 2;
			nbTileLine = Math.floor(nbTileLine);
			var nbLines = Math.ceil(this.nbTiles / nbTileLine);

			// clear the scene and reinitialize its size and reinitialize its
			// size
			this.paper.clear();
			this.paper.setSize(width, nbLines * this.tileSize + (nbLines - 1) *
					this.innerGapSize + finalOuterGapSize);

			// fill the raphael set with the new
			for (var i = 0; i < this.nbTiles; i++) {
				var numCol = (i % nbTileLine);
				var numLine = Math.floor(i / nbTileLine);
				this.element.push(this.paper.rect(
						finalOuterGapSize + numCol * this.tileSize + numCol * this.innerGapSize,
						numLine * this.tileSize + numLine * this.innerGapSize,
						this.tileSize,
						this.tileSize
						)
						.data("name", i)
						.click(function() {
							console.log("click on the tile", this.data("name"));
						}));
			}

			// styling
			this.element.attr({
				"fill" : "#ddddff",
				"stroke-width": "0"
				});
		},
		
		/**
		 * Explicitly remove the callbacks
		 *
		 * @method remove
		 * @override
		 */
		remove:function() {
			$(window).off("resize");
			Backbone.View.prototype.remove.call(this);
		},

		/**
		 * Callback for the window resize event
		 *
		 * @method onresize
		 */
		onresize:function() {
			this.computeTilesLayout();
		}
	});

	// instantiate the router
	var router = new Map.Router();
});
