class Bot {
    constructor() {
        // Directions: 0, 1, 2, 3
        //             right, left, bottom, top

        this.dir = snake[0].dir;
    }

    check_hit(x, y) {
        let ret = false;

        // check hit ...
        snake.slice(1).forEach(v => {
            ret = x == v.x && y == v.y || ret;
        });

        return ret;
    }
    check_hit_whead(x, y) {
        let ret = false;

        // check hit ...
        snake.forEach(v => {
            ret = x == v.x && y == v.y || ret;
        });

        return ret;
    }

    check_not_ok(x, y) {
        let ret = this.check_hit(x, y);

        let all_full = true,
            around = [
                this.next_pos(0, x, y),
                this.next_pos(1, x, y),
                this.next_pos(2, x, y),
                this.next_pos(3, x, y)
            ];

        around.forEach(v => {
            all_full = this.check_hit_whead(v[0], v[1]) && all_full;
        });

        return ret || all_full;
    }

    food_distance(x, y) {
        return Math.floor(Math.sqrt(Math.pow(Math.abs(food.x-x), 2)+Math.pow(Math.abs(food.y-y), 2)));
    }

    next_pos(dir, x, y) {
        let snake_head = snake[0],
            fx, fy;
        dir = dir !== undefined ? dir : this.dir;

        x = x!==undefined ? x : snake_head.x,
            y = y!==undefined ? y : snake_head.y;

        if (dir < 2) {
            fx = x + Math.pow(-1, dir) * (snake_head.speed * snake_head.size);
            fy = y;
        } else {
            fx = x;
            fy = y + Math.pow(-1, dir) * (snake_head.speed * snake_head.size);
        }

        // Check if leaving [x] ... 
        if (fx >= canvas.width) {
            fx = 0;
        } else if (fx < 0) {
            fx = canvas.width - snake_head.size;
        }

        // Check if leaving [y] ... 
        if (fy >= canvas.height) {
            fy = 0;
        } else if (fy < 0) {
            fy = canvas.height - snake_head.size;
        }

        return [fx, fy];
    }

    change_direction() {
        let posbd = [0, 1, 2, 3];

        if (this.dir == 0)
            posbd.splice(1, 1);
        if (this.dir == 1)
            posbd.splice(0, 1);
        if (this.dir == 2)
            posbd.splice(3, 1);
        if (this.dir == 3)
            posbd.splice(2, 1);




        // -- CHECK DIE -- //

        let r = [];
        for (let i = 0; i < posbd.length; i++) {
            let np = this.next_pos(posbd[i]);

            if (this.check_not_ok(np[0], np[1]))
                r.push(posbd[i]);
        }

        for (let i = 0; i < r.length; i++) {
            posbd.splice(posbd.indexOf(r[i]), 1);
        }


        // console.log(posbd);


        // -- YOU WILL DIE :( -- //
        if (posbd.length == 0)
            return -1;



        // -- CHECK FOOD -- //
        let b = posbd[0],
            np = this.next_pos(posbd[0]),
            min_d = this.food_distance(np[0], np[1]);

        for (let i = 1; i<  posbd.length; i++) {
            np = this.next_pos(posbd[i]);

            if (this.food_distance(np[0], np[1]) < min_d) {
                b = posbd[i];
                min_d = this.food_distance(np[0], np[1]);
            }
        }

        return b;
    }

    move() {
        let r = this.change_direction();

        eventQueue[0] = r >= 0 ? r : 0;
        this.dir = r >= 0 ? r : 0;
    }
}