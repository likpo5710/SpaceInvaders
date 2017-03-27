

;(function() {
	var Game = function(canvasId){
		var canvas = document.getElementById(canvasId)
		var screen = canvas.getContext('2d')
		var gameSize = {x: canvas.width, y: canvas.height}

		this.bodies = createInvaders(this).concat(new Player(this, gameSize))

		var self = this
		loadSound("sounds/shoot.wav", function(shootSound){
			self.shootSound = shootSound
		})
		var self = this
		loadSound("sounds/playerShoot.wav", function(playerShootSound){
			self.playerShootSound = playerShootSound
		})
		var tick = function() {
			self.update()
			self.draw(screen, gameSize)
			requestAnimationFrame(tick)
		}

		tick()
	};

	Game.prototype = {

		update: function(){
			var bodies = this.bodies
			var notCollidingWithAnything = function(b1){
				return bodies.filter(function(b2) {return colliding(b1, b2)}).length === 0
			}
			this.bodies = this.bodies.filter(notCollidingWithAnything)

			for (var i = 0; i < this.bodies.length; i++){
				this.bodies[i].update()
			}

	},

		draw: function(screen, gameSize){
			screen.clearRect(0, 0, gameSize.x, gameSize.y)
			for (var i = 0; i < this.bodies.length; i++){
				drawRect(screen, this.bodies[i])
			}
		},

		addBody: function(body){
			this.bodies.push(body)
		},

		invadersBelow: function(invader){
			return this.bodies.filter(function(b){
				return b instanceof Invader && b.center.y > invader.center.y &&
				b.center.x - invader.center.x < invader.size.x
			}).length > 0
		}


	}

	//invader entity
	var Invader = function(game, center) {
		this.game = game
		this.size = { x: 15, y: 15}
		this.center = center
		this.patrolX = 0
		this.speedX = 0.3
	}

	Invader.prototype = {
		update: function(){
			if (this.patrolX < 0 || this.patrolX > 40) {
				this.speedX = -this.speedX
			}
			
			this.center.x += this.speedX
			this.patrolX += this.speedX

			if (Math.random() > 0.995 && !this.game.invadersBelow(this)) {
				var bullet = new Bullet({ x: this.center.x, y: this.center.y + this.size.x/2}, {x: Math.random() - 0.5, y: 2})
				this.game.addBody(bullet)
				//this.game.shootSound.load()
				this.game.shootSound.play()
			}

		}
	}

	var createInvaders = function(game){
		var invaders = []
		for(var i = 0; i < 24; i++){
			var x = 30 + (i % 8) * 30
			var y = 30 + (i % 3) * 30
			invaders.push(new Invader(game, {x: x, y: y}))
		}
		return invaders
	}

	//bullet entity
	var Bullet = function(center, velocity) {

		this.size = { x: 3, y: 3}
		this.center = center
		this.velocity = velocity
	}

	Bullet.prototype = {
		update: function(){
			this.center.x += this.velocity.x
			this.center.y += this.velocity.y

		}
	}
	//player entity
	var Player = function(game, gameSize) {
		this.game = game
		this.size = { x: 15, y: 15}
		this.center = {x: gameSize.x / 2, y: gameSize.y - this.size.x}
		this.keyboarder = new Keyboarder()
	}

	Player.prototype = {
		update: function(){
			if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
				this.center.x -= 2
			}
			else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
				this.center.x += 2
			}
			if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
				var bullet = new Bullet({ x: this.center.x, y: this.center.y - this.size.x/2}, {x: 0, y: -6})
				this.game.addBody(bullet)
				this.game.playerShootSound.load()
				this.game.playerShootSound.play()
			}

		}
	}

	var drawRect = function(screen, body){
		screen.fillRect(body.center.x - body.size.x / 2,
						body.center.y - body.size.y / 2,
						body.size.x, body.size.y)
	}

	//keyboard event handling
	var Keyboarder = function() {
		var KeyState = {}

		window.onkeydown = function(e) {

			KeyState[e.keyCode] = true
		}
		window.onkeyup = function(e) {
			KeyState[e.keyCode] = false
		}

		this.isDown = function(keyCode) {
			return KeyState[keyCode] === true
		}

		this.KEYS = {LEFT: 37, RIGHT: 39, SPACE: 32}
	}

	//colliding function
	var colliding = function(b1,b2){
		return !(b1 === b2 ||
			b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
			b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
			b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
			b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2)
	}

	var loadSound = function(url, callback){
		var loaded = function(){
			callback(sound)
			sound.removeEventListener('canplaythrough', loaded)
		}
		var sound = new Audio(url)
		sound.addEventListener('canplaythrough', loaded)
		sound.load()
		console.log(sound)
	}

	window.onload = function() {
		new Game("screen")
	}

})();
Contact GitHub API Training Shop Blog About
