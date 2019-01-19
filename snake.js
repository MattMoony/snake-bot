// --- GLOBAL VARIABLES && CLASSES --- //

var can = document.getElementById("main_canvas"),
    ctx = can.getContext("2d");

var canvas = {
        width: document.getElementById('main_canvas').width,
        height: document.getElementById('main_canvas').height
    },
    snake = [],
    eventQueue = {},
    foods = [],
    running = false,
    paused = false;

var glob_game_refresh_rate = 1,
    glob_grow_rate = 2,
    glob_food_amount = 6,
    glob_tile_size = 20,
    glob_auto_restart = false,
    glob_die_enabled = true,
    glob_show_grid = false,
    glob_show_astar = false;

var cu_color = 0,
    color_c_amount = 10,
    color_mode = color_c_amount,
    h_color = 360;


var obstacles = [

    ],
    obstacle_gen_amount = 0; // Math.floor(((canvas.width/glob_tile_size) * (canvas.height/glob_tile_size))/20);










class SnakeBody {
    // Directions: 0, 1, 2, 3
    //             right, left, bottom, top

    constructor(direction, x, y, speed = 1, size = glob_tile_size) {
        this.dir = direction;

        this.x = x;
        this.y = y;

        this.speed = speed;
        this.size = size;
    }

    move() {
        // Move according to speed, size, direction and position ... 
        if (this.dir < 2) {
            this.x += Math.pow(-1, this.dir) * (this.speed * this.size);
        } else {
            this.y += Math.pow(-1, this.dir) * (this.speed * this.size);
        }

        // Check if leaving [x] ... 
        if (this.x >= canvas.width) {
            this.x = 0;
            // stop_game();
        } else if (this.x < 0) {
            this.x = canvas.width - this.size;
            // stop_game();
        }

        // Check if leaving [y] ... 
        if (this.y >= canvas.height) {
            this.y = 0;
            // stop_game();
        } else if (this.y < 0) {
            this.y = canvas.height - this.size;
            // stop_game();
        }
    }
}
class Food {
    constructor(x, y, size = glob_tile_size) {
        this.size = size;

        this.spawn(x, y);
        this.draw();
    }

    spawn(x, y) {
        this.x = x || Math.floor(Math.random() * canvas.width / this.size) * this.size;
        this.y = y || Math.floor(Math.random() * canvas.height / this.size) * this.size;

        snake.forEach(v => {
            if (v.x == this.x && v.y == this.y)
                return this.spawn();
        });

        obstacles.forEach(o => {
            if (o[0] * this.size == this.x && o[1] * this.size == this.y)
                return this.spawn();
        });
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,0,0,0.75)";

        ctx.ellipse(this.x+this.size/2, this.y+this.size/2, this.size/2, this.size/2, 0, 0, 2*Math.PI);
        // ctx.rect(this.x, this.y, this.size, this.size);
        ctx.fill();

        ctx.font = "12px Comic Sans MS";
        ctx.fillStyle = "#fff";
        ctx.fillText("🍏", this.x+2, this.y+this.size-6, this.size);
    }
}









// --- FUNCTIONS -- //

function hit_food() {
    let snake_head = snake[0];

    for (let i = 0; i < foods.length; i++) {
        if (snake_head.x == foods[i].x && snake_head.y == foods[i].y)
            return i;
    }

    return -1;
}

function hit_self() {
    let snake_head = snake[0],
        ret;

    snake.slice(1).forEach(v => {
        ret = snake_head.x == v.x && snake_head.y == v.y || ret;
    });

    return ret;
}

function main_loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    ctx.beginPath();
    ctx.fillStyle = "hsl(" + h_color + ", 100%, 50%)";

    let v = snake[0];

    ctx.clearRect(v.x, v.y, v.size, v.size);
    // Check for null and opposite direction ... 
    v.dir = eventQueue[0] != null ? eventQueue[0] + Math.pow(-1, eventQueue[0]) * 1 != v.dir ? eventQueue[0] : v.dir : v.dir;
    v.move();

    ctx.rect(v.x, v.y, v.size, v.size);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "hsl(" + cu_color + ", 100%, 50%)";

    if (cu_color == 360) {
        color_mode = -color_c_amount;
    } else if (cu_color == 0) {
        color_mode = color_c_amount;
    }

    cu_color += color_mode;
    h_color -= color_mode;

    for (let i = 1; i < snake.length; i++) {
        let v = snake[i];

        ctx.clearRect(v.x, v.y, v.size, v.size);
        // Check for null and opposite direction ... 
        v.dir = eventQueue[i] != null ? eventQueue[i] + Math.pow(-1, eventQueue[i]) * 1 != v.dir ? eventQueue[i] : v.dir : v.dir;
        v.move();

        ctx.rect(v.x, v.y, v.size, v.size);
    }
    for (let i = snake.length - 1; i > 0; i--)
        eventQueue[i] = eventQueue[i - 1];

    ctx.fill();

    let hf = hit_food();
    // console.log(hf);
    if (hf >= 0) {
        function grow() {
            let tail = snake[snake.length - 1],
                addon = new SnakeBody(tail.dir, tail.dir < 2 ? tail.x + Math.pow(-1, tail.dir + 1) * (tail.size + tail.size * tail.speed) : tail.x, tail.dir < 2 ? tail.y : tail.y + Math.pow(-1, tail.dir + 1) * (tail.size + tail.size * tail.speed));
            addon.move();
            snake.push(addon);
        }
        for (let i = 0; i < glob_grow_rate; i++)
            grow();

        foods[hf].spawn();
    } else if (hit_self()) {
        // console.log('died ... ');
        if (glob_die_enabled)
            stop_game();
    }

    document.getElementById("current_score").innerHTML = snake.length;

    // -- DRAW FOODS -- //

    foods.forEach(f => f.draw());

    // -- END DRAW FOODS -- //


    // -- GRID -- //

    if (glob_show_grid) {
        ctx.beginPath();
        ctx.strokeStyle = "#444";
        // ctx.fillStyle = ctx.strokeStyle;

        for (let y = 0; y <= canvas.height / v.size; y++) {
            // ctx.fillText(y, 0, (y+1)*v.size, v.size);

            ctx.moveTo(0, y * v.size);
            ctx.lineTo(canvas.width, y * v.size);
        }
        ctx.stroke();

        ctx.beginPath();
        for (let x = 0; x <= canvas.width / v.size; x++) {
            // ctx.fillText(x, x*v.size, v.size, v.size);

            ctx.moveTo(x * v.size, 0);
            ctx.lineTo(x * v.size, canvas.height);
        }
        ctx.stroke();
    }

    // -- END OF GRID -- //

    bot.move();

    document.getElementById('sh_tile_x').innerHTML = snake[0].x / glob_tile_size;
    document.getElementById('sh_tile_y').innerHTML = snake[0].y / glob_tile_size;
}

function inFoods(food_coordinates) {
    for (let i = 0; i < foods.length; i++) {
        if (foods[i].x == food_coordinates[0] && foods[i].y == food_coordinates[1]) {
            return true;
        }
    }

    return false;
}

function delFood(food_coordinates) {
    for (let i = 0; i < foods.length; i++) {
        if (foods[i].x == food_coordinates[0] && foods[i].y == food_coordinates[1]) {
            foods.splice(i, 1);
            return;
        }
    }
}

function inObs(obs) {
    for (let i = 0; i < obstacles.length; i++) {
        if (obstacles[i][0] == obs[0] && obstacles[i][1] == obs[1]) {
            return true;
        }
    }

    return false;
}

function delObstacle(obs) {
    for (let i = 0; i < obstacles.length; i++) {
        if (obstacles[i][0] == obs[0] && obstacles[i][1] == obs[1]) {
            obstacles.splice(i, 1);
            return;
        }
    }
}

function gen_obstacle() {
    let obs = [Math.floor(Math.random() * (canvas.width / glob_tile_size)), Math.floor(Math.random() * (canvas.height / glob_tile_size))];

    while (inObs(obs)) {
        obs = [Math.floor(Math.random() * (canvas.width / glob_tile_size)), Math.floor(Math.random() * (canvas.height / glob_tile_size))];
    }

    return obs;
}


function start_game() {
    for (let i = 0; i < obstacle_gen_amount; i++)
        obstacles.push(gen_obstacle());

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    eventQueue = {};

    snake = [new SnakeBody(0, 80, 20), new SnakeBody(0, 60, 20), new SnakeBody(0, 40, 20)];
    game_refresh_interval = window.setInterval(main_loop, glob_game_refresh_rate);

    bot = new Bot();

    for (let i = foods.length; i < glob_food_amount; i++)
        foods.push(new Food());

    running = true;
}

function pause_game() {
    window.clearInterval(game_refresh_interval);
    paused = true;
}

function continue_game() {
    if (running) {
        game_refresh_interval = window.setInterval(main_loop, glob_game_refresh_rate);
        paused = false;
    }
}

function stop_game() {
    if (snake.length > localStorage.getItem("high_score")) {
        // window.alert("New Highscore!");
        // let uname = window.prompt("Enter your name: ");

        localStorage.setItem("high_uname", "bot");
        localStorage.setItem("high_score", snake.length);
    }

    // window.alert(" Y O U   D I E D ! \n Length: " + snake.length);
    window.clearInterval(game_refresh_interval);

    // if (snake.length > localStorage.getItem("high_score")) {
    //     window.alert("New Highscore!");
    //     let uname = window.prompt("Enter your name: ");

    //     localStorage.setItem("high_uname", uname);
    //     localStorage.setItem("high_score", snake.length);
    // }
    // snake.splice(3);

    // document.getElementById("high_uname").innerHTML = localStorage.getItem("high_uname");
    // document.getElementById("high_score").innerHTML = localStorage.getItem("high_score");

    running = false;

    if (glob_auto_restart) {
        window.setTimeout(() => {
            start_game();
        }, 4000);
    }
}