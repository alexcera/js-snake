if (!window.requestAnimationFrame) {
	window.requestAnimationFrame = (function() {
		return window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback) {
				//gameloop fallbacks to 60fps
				window.setTimeout(callback, 1000 / 60);
			};
	})();
}



var canvas,
	context,
	Game,
	Snake,
	Food,
	Direction;



canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
context = canvas.getContext('2d');
document.body.appendChild(canvas);



Game = (function() {

	var ready = false;

	var blockSize = 20;

	var mapFillStyle = '#0D0D0D';

	var mapStrokeStyle = '#002608';

	function start() {
		ready = true;
	};

	function stop() {
		ready = false;
	};

	function getBlockSize() {
		return blockSize;
	};

	function applyStyle(ctx, x, y) {
		ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
		ctx.lineWidth = .5;
		ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
	};

	function isReady() {
		return ready;
	};

	function clearMap() {
		context.fillStyle = mapFillStyle;
		context.strokeStyle = mapStrokeStyle;
		for (var x = canvas.width - blockSize; x >= 0; x--) {
			for (var y = canvas.height - blockSize; y >= 0; y--) {
				applyStyle(context, x, y);
			};
		};
	};

	function showStartText() {
		context.font = "bold 35px sans-serif";
		context.fillStyle = '#FFFFFF';
		context.fillText("Press space bar to start!", canvas.width / 4, canvas.height / 2);
	};

	return {
		// initial FPS/Speed of the game
		FPS: 50,

		start: start,

		stop: stop,

		blockSize: getBlockSize,

		isReady: isReady,

		clearMap: clearMap,

		showStartText: showStartText,

		applyStyle: applyStyle
	};
}());



;
Direction = (function() {
	return {
		// keycode mappings for the arrow keys
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
	};
}());



Food = (function() {

	var foodFillStyle = '#FF6363';
	var foodStrokeStyle = '#FFA8A8';

	var x = null;
	var y = null;

	var consumed = true;

	function generateRandomCoordinates() {
		var x = Math.floor(Math.random() * (canvas.width / Game.blockSize()));
		var y = Math.floor(Math.random() * (canvas.height / Game.blockSize()));
		return {
			x: x,
			y: y
		};
	};

	function isValidCoordinates(x, y, snakeSegments) {
		var valid = true;

		for (var i = snakeSegments.length - 1; i >= 0; i--) {
			if (snakeSegments[i].x === x && snakeSegments[i].y === y) {
				valid = false;
				break;
			}
		};

		return valid;
	}

	function generateValidCoordinates(snakeSegments) {
		var haventFoundAValidCoordinates = true;
		var coordinates;
		while (haventFoundAValidCoordinates) {
			coordinates = generateRandomCoordinates();
			if (isValidCoordinates(coordinates.x, coordinates.y, snakeSegments)) {
				haventFoundAValidCoordinates = false;
				break;
			}
		}
		x = coordinates.x;
		y = coordinates.y;
	};

	function checkIfConsumed(snakeSegments) {
		for (var i = snakeSegments.length - 1; i >= 0; i--) {
			var snakeX = snakeSegments[i].x;
			var snakeY = snakeSegments[i].y;
			if (x === snakeX && y === snakeY) {
				consumed = true;
				break;
			}
		};
	};

	function draw(snakeSegments) {

		checkIfConsumed(snakeSegments);

		if (consumed) {
			generateValidCoordinates(snakeSegments);
			consumed = false;
		}

		context.fillStyle = foodFillStyle;
		context.strokeStyle = foodStrokeStyle;

		Game.applyStyle(context, x, y);
	};

	function init(snakeSegments) {
		generateValidCoordinates(snakeSegments);
	};


	function consumed() {
		return consumed;
	};

	return {
		consumed: consumed,
		draw: draw,
		init: init
	};
}());



;
Snake = (function() {

	//initial size of the snake
	var segmentCount = 5;

	//a queue data struct for the body of the snake
	var segments = [];

	//RIGHT = initial direction of snake
	var direction = Direction.RIGHT;

	var newDirection = Direction.RIGHT;

	var snakeFillStyle = '#FFFFFF';

	var snakeStrokeStyle = '#D1D1D1';

	function head() {
		return segments[0];
	};

	function fillSegment(segment) {
		context.fillStyle = snakeFillStyle;
		context.strokeStyle = snakeStrokeStyle;
		Game.applyStyle(context, segment.x, segment.y);
	};

	function getNextHeadBasedOnDirection() {
		var x = head().x;
		var y = head().y;
		switch (newDirection) {
			case Direction.RIGHT:
				if (direction !== Direction.LEFT) {
					x++;
					direction = newDirection;
				}
				break;
			case Direction.LEFT:
				if (direction != Direction.RIGHT) {
					x--;
					direction = newDirection;
				}
				break;
			case Direction.UP:
				if (direction !== Direction.DOWN) {
					y--;
					direction = newDirection;
				}
				break;
			case Direction.DOWN:
				if (direction !== Direction.UP) {
					y++;
					direction = newDirection;
				}
				break;
			default:
				break;
		};
		return {
			x: x,
			y: y
		};
	};

	function setDirection(keyCode) {
		switch (keyCode) {
			case Direction.RIGHT:
				if (direction !== Direction.LEFT) {
					newDirection = Direction.RIGHT;
				}
				break;
			case Direction.LEFT:
				if (direction != Direction.RIGHT) {
					newDirection = Direction.LEFT;
				}
				break;
			case Direction.UP:
				if (direction !== Direction.DOWN) {
					newDirection = Direction.UP;
				}
				break;
			case Direction.DOWN:
				if (direction !== Direction.UP) {
					newDirection = Direction.DOWN;
				}
				break;
			default:
				break;
		};
	};

	function init() {
		segments = [];
		direction = Direction.RIGHT;
		newDirection = Direction.RIGHT;
		for (var i = segmentCount - 1; i >= 0; i--) {
			segments.push({
				x: i,
				y: 0
			});
		};
	};

	/*
	 *	updates the values of snake such as direction, etc etc.
	 * 	according to user-input
	 */
	function update() {
		var nextHead = getNextHeadBasedOnDirection();
		var tail = segments.pop();
		tail.x = nextHead.x;
		tail.y = nextHead.y;
		segments.unshift(tail);
	};

	/*
	 *	draws the snake using the updated values
	 */
	function draw() {
		for (var i = segments.length - 1; i >= 0; i--) {
			fillSegment(segments[i]);
		};
	};

	function collided() {
		var nextHead = getNextHeadBasedOnDirection();
		var collided = false;

		//self collision
		for (var i = segments.length - 1; i >= 0; i--) {
			if (nextHead.x === segments[i].x && nextHead.y === segments[i].y) {
				collided = true;
				break;
			}
		};

		if (nextHead.x * Game.blockSize() > canvas.width - Game.blockSize() || nextHead.x < 0) {
			collided = true;
		}

		if (nextHead.y * Game.blockSize() > canvas.height - Game.blockSize() || nextHead.y < 0) {
			collided = true;
		}


		return collided;
	}

	function getSegments() {
		return segments;
	}

	return {
		update: update,
		draw: draw,
		init: init,
		setDirection: setDirection,
		collided: collided,
		segments: getSegments
	};

})();



var registerKeyListeners = function() {
	document.addEventListener('keydown', function(e) {
		if (32 === e.keyCode) {
			Game.start();
		}
		Snake.setDirection(e.keyCode);
	}, false);
};



var gameLoop = function() {
	setTimeout(function() {
		var requestId = requestAnimationFrame(gameLoop);
		if (Game.isReady()) {
			Game.clearMap();
			if (Snake.collided()) {
				Game.stop();
			} else {
				Snake.update();
				Snake.draw();
			}
		} else {
			Game.clearMap();
			Snake.init();
			Snake.draw();
			Game.showStartText();
		}

		Food.draw(Snake.segments());

	}, 1000 / Game.FPS);
};

registerKeyListeners();
gameLoop();