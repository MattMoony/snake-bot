class Node {
    constructor(cost) {
        this.cost = cost;

        this.pastCost = -1;
        this.allDiscovered = false;

        this.neighbours = [];
        this.movms = [];
        this.pastPath = [];
    }
}

class Playground {
    constructor(matrix) {
        this.width = matrix[0].length;
        this.height = matrix.length;

        let height = this.height,
            width = this.width;

        this.content = new Array(height * width);

        // Squash into 1D array ... 
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                this.content[y * width + x] = new Node(matrix[y][x]);
            }
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let cu_node = this.content[y * width + x];

                if (x - 1 >= 0) {
                    cu_node.neighbours.push(y * width + (x - 1));
                    cu_node.movms.push(1);
                } else {
                    cu_node.neighbours.push(y * width + (matrix[0].length - 1));
                    cu_node.movms.push(1);
                }

                if (x + 1 < width) {
                    cu_node.neighbours.push(y * width + (x + 1));
                    cu_node.movms.push(0);
                } else {
                    cu_node.neighbours.push(y * width + (0));
                    cu_node.movms.push(0);
                }

                if (y - 1 >= 0) {
                    cu_node.neighbours.push((y - 1) * width + x);
                    cu_node.movms.push(3);
                } else {
                    cu_node.neighbours.push((matrix.length - 1) * width + x);
                    cu_node.movms.push(3);
                }

                if (y + 1 < height) {
                    cu_node.neighbours.push((y + 1) * width + x);
                    cu_node.movms.push(2);
                } else {
                    cu_node.neighbours.push(0 * width + x);
                    cu_node.movms.push(2);
                }
            }
        }
    }

    shortestPathPointToPoint(startX, startY, goalX, goalY) {
        // console.log(this.content);
        // window.prompt(this.content);

        this.frontier = [];
        let frontier = this.frontier;
        let content = this.content;

        let width = this.width,
            height = this.height;

        let start = this.content[startY * width + startX],
            goal = this.content[goalY * width + goalX];
        let start_index = startY * width + startX,
            goal_index = goalY * width + goalX;

        // window.prompt(goal_index);
        // window.prompt(this.content[goal_index].neighbours);

        // window.prompt(start_index);
        // window.prompt(this.content[start_index].neighbours);

        start.pastCost = start.cost;
        // window.prompt(start.pastCost);
        start.pastPath.push(start_index);
        frontier.push(start_index);

        let distance = Number.MAX_SAFE_INTEGER;

        let rounds = 0;

        while (!frontier.includes(goal_index)) {
            if (rounds++ > this.content.length)
                throw "Baum!";

            let addition_index = 0,
                neighbours_not_in_frontier = 0;

            // console.log(frontier.length);

            let remove_indexes = [];

            frontier.forEach(f => {
                this.content[f].neighbours.forEach(neighbour => {
                    if (frontier.includes(neighbour) || this.content[neighbour].allDiscovered) {
                        return;
                    }

                    neighbours_not_in_frontier++;
                    if (content[neighbour].cost + content[f].pastCost <= distance) {
                        addition_index = neighbour;
                        distance = content[neighbour].cost + content[f].pastCost;

                        content[addition_index].pastPath = content[f].pastPath.slice();
                        content[addition_index].pastPath.push(addition_index);
                    }
                });

                if (neighbours_not_in_frontier == 0) {
                    this.content[f].allDiscovered = true;
                    remove_indexes.push(f);
                }
            });

            // window.prompt("add" + addition_index);

            content[addition_index].pastCost = distance;
            frontier.push(addition_index);

            distance = Number.MAX_SAFE_INTEGER;
            frontier = frontier.filter(v => !remove_indexes.includes(v));
        }

        let pastPath = [goal.pastPath.length];
        for (let i = 0; i < goal.pastPath.length; i++) {
            pastPath[i] = this.content[goal.pastPath[i]];
        }

        // console.log(" DONE!");

        return pastPath;
    }

    get_movements(path) {
        let movms = [];

        for (let i = 0; i < path.length - 1; i++) {
            movms.push(path[i].movms[path[i].neighbours.indexOf(this.content.indexOf(path[i + 1]))]);
        }

        return movms;
    }
}














class Bot {
    constructor() {
        this.food_x = null;
        this.food_y = null;

        this.path = [];
    }

    rate_grid(x, y, v, xv, yv, grid) {
        if (x < 0 || x >= grid[0].length || y < 0 || y >= grid.length)
            return;

        grid[y][x] = v;

        if (x < this.food_x) {
            for (let fx = x - 1, i = v + 1; fx >= 0; fx--, i++)
                grid[y][fx] = i;
            for (let fx = x + 1, i = v - 1; fx <= this.food_x; fx++, i--)
                grid[y][fx] = i;

            for (let fx = this.food_x + 1, i = grid[y][this.food_x] + 1; fx < grid[0].length; fx++, i++)
                grid[y][fx] = i;
        } else {
            for (let fx = x + 1, i = v + 1; fx < grid[0].length; fx++, i++)
                grid[y][fx] = i;
            for (let fx = x - 1, i = v - 1; fx >= this.food_x; fx--, i--)
                grid[y][fx] = i;

            for (let fx = this.food_x - 1, i = grid[y][this.food_x] + 1; fx >= 0; fx--, i++)
                grid[y][fx] = i;
        }

        this.rate_grid(x + xv, y + yv, v + 2, xv, yv, grid);
    }

    playground_to_grid() {
        var grid = [];

        for (let y = 0; y < canvas.height / snake[0].size; y++) {
            grid.push([]);

            for (let x = 0; x < canvas.width / snake[0].size; x++) {
                grid[y].push(null);
            }
        }

        let fx = food.x / snake[0].size,
            fy = food.y / snake[0].size;

        this.food_x = fx;
        this.food_y = fy;

        grid[fy][fx] = 0;

        for (let x = fx - 1, i = 1; x >= 0; x--, i++)
            grid[fy][x] = i;
        for (let x = fx + 1, i = 1; x < grid[0].length; x++, i++)
            grid[fy][x] = i;

        this.rate_grid(fx - 1, fy - 1, 2, -1, -1, grid);
        this.rate_grid(fx - 1, fy + 1, 2, -1, 1, grid);
        this.rate_grid(fx + 1, fy + 1, 2, 1, 1, grid);
        this.rate_grid(fx + 1, fy - 1, 2, 1, -1, grid);

        // grid.forEach(v => {
        //     console.log(v.join('\t'));
        // });

        return grid;
    }

    move() {
        if (this.path.length <= 25) {
            let grid = this.playground_to_grid(),
                sh = snake[0];

            snake.slice(1).forEach(s => {
                grid[s.y / sh.size][s.x / sh.size] = Number.MAX_SAFE_INTEGER;
            });

            // Directions: 0, 1, 2, 3
            //             right, left, bottom, top

            // window.prompt();

            let p = new Playground(grid);

            // window.prompt();

            // window.prompt(sh.x/sh.size + ", " + sh.y/sh.size + ", " + this.food_x + ", " + this.food_y);

            try {
                let r = p.shortestPathPointToPoint(sh.x / sh.size, sh.y / sh.size, this.food_x, this.food_y);

                this.path = p.get_movements(r);
                this.path.reverse();
            } catch (e) {
                snake.forEach(s => {
                    grid[s.y / sh.size][s.x / sh.size] = Number.MAX_SAFE_INTEGER;
                });

                // Directions: 0, 1, 2, 3
                //             right, left, bottom, top

                let ne = [
                    (sh.x / sh.size + 1 < grid[0].length ? grid[sh.y / sh.size][sh.x / sh.size + 1] : grid[sh.y/sh.size][0]),
                    (sh.x / sh.size - 1 >= 0 ? grid[sh.y / sh.size][sh.x / sh.size - 1] : grid[sh.y/sh.size][grid[0].length-1]),
                    (sh.y / sh.size + 1 < grid.length ? grid[sh.y / sh.size + 1][sh.x / sh.size] : grid[0][sh.x / sh.size]),
                    (sh.y / sh.size - 1 >= 0 ? grid[sh.y / sh.size - 1][sh.x / sh.size] : grid[grid.length-1][sh.x / sh.size])
                ];
                this.path = [ne.indexOf(Math.min(...ne))];
            }
            // console.log(r);

            // window.prompt();

            // console.log(this.path);
            // window.prompt();
        }

        eventQueue[0] = this.path.pop();
    }
}