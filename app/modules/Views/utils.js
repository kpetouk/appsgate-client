define( function() {
			Math.easeInOutQuad = function (t, b, c, d) {
				t /= d/2;
				if (t < 1) return c/2*t*t + b;
				t--;
				return -c/2 * (t*(t-2) - 1) + b;
			};

			window.requestAnimFrame = (function(){
				return  window.requestAnimationFrame       ||
					    window.webkitRequestAnimationFrame ||
					    window.mozRequestAnimationFrame    ||
					    function( callback ){window.setTimeout(callback, 1000 / 60);};
				})();
			
			return Math.easeInOutQuad;
		}
	);
