function AirGame() {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.w = this.canvas.width;
    this.h = this.canvas.height;

    this.isAnimationActive = false;

    //borders of field
    this.xmax = 430;
    this.ymax = 580;
    this.xmin = 20;
    this.ymin = 20;

    //slowing speed
    this.slowDown = 0.98321;

    this.ballSpeed = 12;

    this.ballRadius = 20;
    this.batRadius = 20;

    //limit of the ball
    this.ballXmax = this.xmax - this.ballRadius /2;
    this.ballXmin = this.xmin + this.ballRadius /2;
    this.ballYmax = this.ymax - this.ballRadius /2;
    this.ballYmin = this.ymin + this.ballRadius /2;

    //points
    this.yourPoint = 0;
    this.aiPoint = 0;

    var self = this;
    document.getElementById('pause').addEventListener('click', function() {
        if(self.isAnimationActive) {
            self.isAnimationActive = false;
        } else {
            self.isAnimationActive = true;
            self.init_game();
        }
    });
}

AirGame.prototype.init_game = function() {
    var self = this;

    //start positions of ball and bat
    this.initBallPosX = this.w/2;
    this.initBallPosY = this.h/2;
    this.initBatPosX = 150;
    this.initBatPosY = 500;

    this.initAIBatPosX = this.w/2;
    this.initAIBatPosY = 150;

    this.xAISpeed = 4;
    this.yAISpeed = 4;

    //ball not moving yet
    this.ballSpeedX = 0;
    this.ballSpeedY = 0;

    this.isAnimationActive = true;

    var cb = function() {
        if(!self.isAnimationActive) {
            return;
        }
        self.ballSpeedX = self.ballSpeedX * self.slowDown;
        self.ballSpeedY = self.ballSpeedY * self.slowDown;

        self.initBallPosX += self.ballSpeedX;
        self.initBallPosY += self.ballSpeedY;

        self.collision();
        self.checkGoal();
        self.AI();
        self.draw();

        requestAnimationFrame(cb);
    };
    cb();


    this.canvas.addEventListener('mousemove', function(evt) {
        var mousePos = self.getMousePos(self.canvas, evt);
        var halfFieldY = self.h/2 + self.batRadius;

        self.initBatPosX = mousePos.x;
        if(mousePos.y + self.batRadius < halfFieldY) {
            self.initBatPosY = self.h/2 ;
        } else {
            self.initBatPosY = mousePos.y;
        }
    }, false);
};

AirGame.prototype.collision = function() {

    this.checkBatStrike(this.initBatPosX, this.initBatPosY, this.batRadius);
    this.checkBatStrike(this.initAIBatPosX, this.initAIBatPosY, this.batRadius);

    //limit of the ball
    this.ballXmax = this.xmax - this.ballRadius /2;
    this.ballXmin = this.xmin + this.ballRadius /2;
    this.ballYmax = this.ymax - this.ballRadius /2;
    this.ballYmin = this.ymin + this.ballRadius /2;

    //collision with borders
    if((this.initBallPosX >= this.ballXmax || this.initBallPosX <= this.ballXmin)) {
        this.ballSpeedX *= -1;
    }
    if((this.initBallPosY >= this.ballYmax || this.initBallPosY <= this.ballYmin)) {
        this.ballSpeedY *= -1;
    }
};

AirGame.prototype.checkBatStrike = function(batX, batY, batR) {
    var dbt = (batR+this.ballRadius);
    var distance = this.dist(batX, batY, this.initBallPosX, this.initBallPosY);

    if (distance < dbt) {
        //speed of the ball equal the distance between bat and ball, divided by dbt, and multiply by ball speed
        this.ballSpeedX = (this.initBallPosX-batX) / dbt * this.ballSpeed;
        this.ballSpeedY = (this.initBallPosY-batY) / dbt * this.ballSpeed;
    }
};

AirGame.prototype.AI = function() {
    this.xAISpeed = 2;
    //CPU AI! if the ball on its side, it try to match Y coordinate with ball.
    //And return to init position when ball is out
    if (this.initBallPosY <= this.h/2) {
        if (this.initBallPosY - this.ballRadius > this.initAIBatPosY) {
            this.initAIBatPosY += this.yAISpeed;
        }
        else {
            this.initAIBatPosY -= this.yAISpeed;
        }
    }
    else if (this.initAIBatPosY > 150) {
        this.initAIBatPosY -= 2;
    }
    else if (this.initAIBatPosY < 150) {
        this.initAIBatPosY += 2;
    }

    //If the ball behind AI, it moves out of ball's way
    if (this.initBallPosY < this.initAIBatPosY && this.initBallPosX == this.initAIBatPosX) {
        this.xAISpeed = 8;
    }

    //Make CPU move towards the ball's x coord
    if (this.initAIBatPosX < this.initBallPosX ) {
        this.initAIBatPosX += this.xAISpeed;
    }
    if (this.initAIBatPosX > this.initBallPosX ) {
        this.initAIBatPosX -= this.xAISpeed;
    }
};

AirGame.prototype.checkGoal = function() {
    if (this.initBallPosY >= this.ymax - this.ballRadius && this.initBallPosX >= 180 && this.initBallPosX <= 270 ) {
        this.aiPoint++;
        this.isAnimationActive = false;
    }
    if (this.initBallPosY <= this.ymin + this.ballRadius && this.initBallPosX >= 180 && this.initBallPosX <= 270 ) {
        this.yourPoint++;
        this.isAnimationActive = false;
    }
};

AirGame.prototype.dist = function(init_bat_x, init_bat_y, init_ball_x, init_ball_y) {
    var a = Math.abs(init_ball_x - init_bat_x);
    var b = Math.abs(init_ball_y - init_bat_y);
    return Math.sqrt(a*a + b*b);
};

AirGame.prototype.draw = function() {
    //console.time('test');
    this.ctx.clearRect(0, 0, this.w, this.h);

    //field
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 20;
    this.ctx.strokeRect(0, 0, this.w, this.h);

    //half field line
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.h/2);
    this.ctx.lineTo(this.w, this.h/2);
    this.ctx.lineWidth = 5;
    this.ctx.stroke();

    //half field circle
    this.ctx.beginPath();
    this.ctx.arc(this.w/2, this.h/2, 50, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = 'white';
    this.ctx.fill();
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = 'black';
    this.ctx.stroke();

    //game bat
    this.ctx.beginPath();
    this.ctx.arc(this.initBatPosX, this.initBatPosY, this.batRadius, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = 'green';
    this.ctx.fill();
    //game bat highlight for touch devices
    this.ctx.beginPath();
    this.ctx.arc(this.initBatPosX, this.initBatPosY, 30, 0, 2 * Math.PI, false);
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = 'red';
    this.ctx.stroke();
    //game AI bat
    this.ctx.beginPath();
    this.ctx.arc(this.initAIBatPosX, this.initAIBatPosY, this.batRadius, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = 'green';
    this.ctx.fill();

    //game ball
    this.ctx.beginPath();
    this.ctx.arc(this.initBallPosX, this.initBallPosY, this.ballRadius, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = 'red';
    this.ctx.fill();

    //goals
    this.ctx.beginPath();
    this.ctx.moveTo(175, this.h);
    this.ctx.lineTo(275, this.h);
    this.ctx.lineWidth = 20;
    this.ctx.strokeStyle = 'white';
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(175, 0);
    this.ctx.lineTo(275, 0);
    this.ctx.lineWidth = 20;
    this.ctx.stroke();

    //goals
    this.ctx.fillStyle = 'black';
    this.ctx.fillText('Ai: '+ this.aiPoint.toString(), 20, this.h-20);
    this.ctx.fillText('You: '+ this.yourPoint.toString(), 20, this.h-30);
    //console.timeEnd('test');
};

AirGame.prototype.getMousePos = function(canvas, evt) {
    var rect = this.canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    }
};

var airGame = new AirGame();

airGame.init_game();