// --- A* SEARCH START --- //

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    neighbour(grid, off_x, off_y) {
        off_x = off_x || 0;
        off_y = off_y || 0;

        let x = this.x + off_x,
            y = this.y + off_y;

        if (x < 0)
            x = grid[0].length - 1;
        else if (x >= grid[0].length)
            x = 0;

        if (y < 0)
            y = grid.length - 1;
        else if (y >= grid.length)
            y = 0;

        return grid[y][x];
    }

    neighbours(grid) {
        let ns = [];

        let n = this.neighbour(grid, -1, 0);
        if (n != null)
            ns.push(n);

        n = this.neighbour(grid, 1, 0);
        if (n != null)
            ns.push(n);



        n = this.neighbour(grid, 0, -1);
        if (n != null)
            ns.push(n);

        n = this.neighbour(grid, 0, 1);
        if (n != null)
            ns.push(n);


        let sh = snake[0];
        ns.slice(0).forEach(p => {
            snake.slice(0).forEach(s => {
                if (s.x / sh.size == p.x && s.y / sh.size == p.y)
                    console.log('NEIGHBOURS CONTAINS SNAKE!');
            });
        });

        return ns;
    }

    toString() {
        return "Px(" + this.x + "," + this.y + ")";
    }
}

class PriorityQueue {
    constructor() {
        this.els = [];
    }

    empty() {
        return this.els.length == 0;
    }

    put(item, pri) {
        for (let i = 0; i < this.els.length; i++) {
            if (this.els[i][0] > pri) {
                this.els.splice(i, 0, [pri, item]);
                return;
            }
        }
        this.els.push([pri, item]);
    }

    get() {
        return this.els.splice(0, 1)[0][1];
    }
}

function x_dist(n, g, grid) {
    return Math.min(Math.abs(n.x - g.x), Math.abs(n.x - grid[0].length) + g.x, n.x + Math.abs(g.x - grid[0].length));
}

function y_dist(n, g, grid) {
    return Math.min(Math.abs(n.y - g.y), Math.abs(n.y - grid.length) + g.y, n.y + Math.abs(g.y - grid.length));
}

function h_est(n, g, grid) {
    return x_dist(n, g, grid) + y_dist(n, g, grid); // 4 directions
    // return Math.max(x_dist(n, g, grid), y_dist(n, g, grid)); // 8 directions
    // return Math.sqrt(Math.pow(x_dist(n, g, grid), 2) + Math.pow(y_dist(n, g, grid), 2)); // All directions
}

function reversed(arr) {
    let x = arr;
    x.reverse();
    return x;
}

function recon_path(n, start, past) {
    let nodes = [n];

    while (!nodes.includes(start)) {
        nodes.push(past[nodes[nodes.length - 1]]);
    }

    return reversed(nodes);
}

function directions(past_path) {
    // Directions: 0, 1, 2, 3
    //             right, left, bottom, top

    let dpath = [];

    for (let i = 0; i < past_path.length - 1; i++) {
        if (past_path[i + 1].x - past_path[i].x != 0) {
            if (past_path[i + 1].x - past_path[i].x > 0) {
                dpath.push(0);
            } else {
                dpath.push(1);
            }
        } else {
            if (past_path[i + 1].y - past_path[i].y > 0) {
                dpath.push(2);
            } else {
                dpath.push(3);
            }
        }
    }

    return dpath;
}


function astar_search(grid, start, goal) {
    let open = new PriorityQueue(),
        closed = [],
        open_contains = {};

    open.put(start, 0);
    let g = {},
        past = {};
    g[start] = 0;

    while (!open.empty()) {
        let cu = open.get();

        if (cu.x == goal.x && cu.y == goal.y)
            return recon_path(cu, start, past);

        closed.push(cu);

        cu.neighbours(grid).forEach(n => {

            if (glob_show_astar) {
                ctx.fillStyle = "rgba(182, 255, 181, 0.05)";
                ctx.fillRect(n.x * glob_tile_size, n.y * glob_tile_size, glob_tile_size, glob_tile_size);
            }


            if (closed.includes(n))
                return;

            d_score = g[cu] + 1;

            if (!open_contains[n.toString()]) {
                open_contains[n.toString()] = true;
            } else if (d_score >= g[n]) {
                return;
            }

            past[n] = cu;
            g[n] = d_score;

            open.put(n, d_score + h_est(n, goal, grid));
        });
    }

    return [];
}

// --- A* SEARCH DONE --- //







// --- BOT START --- //

class Bot {
    constructor() {
        this.food_x = null;
        this.food_y = null;

        this.path = [];

        this.rollingUp = false;
        this.movs = 0;
        this.rollUpLength = 3;
    }

    canvas_to_grid() {
        let grid = [],
            sh = snake[0];

        for (let y = 0; y < canvas.height / snake[0].size; y++) {
            grid.push([]);

            for (let x = 0; x < canvas.width / snake[0].size; x++) {
                grid[y].push(new Point(x, y));
            }
        }

        snake.slice(0).forEach(s => {
            grid[s.y / sh.size][s.x / sh.size] = null;
        });
        obstacles.forEach(o => {
            grid[o[1]][o[0]] = null;
        });

        return grid;
    }

    move() {
        if (!this.rollingUp && this.movs % 200 != 0) {
            let grid = this.canvas_to_grid(),
                sh = snake[0];


            ctx.font = "25px Comic Sans MS";
            for (let y = 0; y < grid.length; y++) {
                for (let x = 0; x < grid[y].length; x++) {
                    ctx.fillStyle = grid[y][x] == null ? "#fff" : "#444";
                    ctx.fillText(grid[y][x] == null ? "#" : " ", x * sh.size, (y + 1) * sh.size, sh.size);
                }
            }


            let paths = [];
            foods.forEach(food => {
                // Directions: 0, 1, 2, 3
                //             right, left, bottom, top

                let fx = food.x / sh.size,
                    fy = food.y / sh.size;

                paths.push(astar_search(grid, new Point(sh.x / sh.size, sh.y / sh.size), new Point(fx, fy)));
            });


            let mi = 0;
            for (let i = 1; i < paths.length; i++) {
                if ((paths[i].length < paths[mi].length || paths[mi].length == 0) && paths[i].length > 0)
                    mi = i;
            }


            if (glob_show_astar) {
                paths.forEach(p => {
                    p.forEach(x => {
                        ctx.fillStyle = "rgba(230, 158, 255, 0.4)";
                        ctx.fillRect(x.x * sh.size, x.y * sh.size, sh.size, sh.size);
                    });
                });

                paths[mi].forEach(x => {
                    ctx.fillStyle = "rgba(255, 248, 56, 0.6)";
                    ctx.fillRect(x.x * sh.size, x.y * sh.size, sh.size, sh.size);
                });
            }




            try {
                document.getElementById('fx').innerHTML = paths[mi][paths[mi].length - 1].x;
                document.getElementById('fy').innerHTML = paths[mi][paths[mi].length - 1].y;
            } catch (e) {
                document.getElementById('fx').innerHTML = "-";
                document.getElementById('fy').innerHTML = "-";
            }

            // window.alert();

            // console.log(paths.join('|||'));
            this.path = directions(paths[mi]);
            // console.log("paths: " + paths[mi].join(', '));
            // console.log("path: " + this.path.join(', '));

            this.path.reverse();
        } else {
            // if (this.movs % 200 == 0) {
            //     console.log('NOW');

            //     let sh = snake[0],
            //         movms = 0;
            //     this.path = [];


            // }
            // -- LATER... MAYBE ...  :thinking: -- //
            this.path = [];

            if (this.path.length == 0)
                this.rollingUp = false;
        }

        eventQueue[0] = this.path.pop();
        this.movs++;
    }
}

// --- BOT DONE --- //