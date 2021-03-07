//TODO: 
// -add a grid and adjust CSS so everything lines up better

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const TILE_SIZE = 32;
const WIDTH = 20;
const HEIGHT = 15;


// input control
const inputControl = {
    keyEnum: Object.freeze({'KeyW': 0, 'ArrowUp':    0, 
                            'KeyA': 1, 'ArrowLeft':  1, 
                            'KeyS': 2, 'ArrowDown':  2,
                            'KeyD': 3, 'ArrowRight': 3}),
    currentKey: 3,
    updateKey(keyCode) {
        if(this.keyEnum.hasOwnProperty(keyCode)) {
            this.currentKey = this.keyEnum[keyCode];
        }
    },
    init() {
        window.addEventListener('keydown', e=>this.updateKey(e.code));
    },
};


// render apple
function AppleRender(props) {
    return(
        <div className="apple"
             style={{
                left: props.x,
                top: props.y,
            }}>
        </div>
    );
}


// render a snake part
function SnakePart(props) {
    return (
        <div
            className={props.bodyPart}
            style={{
                left: props.x,
                top: props.y,
            }}>
        </div>
    );
}


// render whole snake with snakeParts
function RenderSnake(props) {
    let parts = props.body.map((part, index) => {
        return part = <SnakePart 
            key = {index}
            x={props.body[index][0] + (!index ? 0 : 1)} 
            y={props.body[index][1] + (!index ? 0 : 1)} 
            bodyPart={!index ? "head" : "body"}/>
    });
    return(
        parts
    );
}


// apple manager
const Apple = {
    x: Math.floor(Math.random() * WIDTH) * TILE_SIZE,
    y: Math.floor(Math.random() * HEIGHT) * TILE_SIZE,
    newPosition() {
        this.x=Math.floor(Math.random() * WIDTH) * TILE_SIZE;
        this.y=Math.floor(Math.random() * HEIGHT) * TILE_SIZE;
    },
    render() {
        return( <AppleRender x={this.x} y={this.y} />);
    },
};


// snake manager
const Snake = {
    body: [[5*TILE_SIZE, 7*TILE_SIZE, 3], [4*TILE_SIZE, 7*TILE_SIZE, 3]],
    pivots: [],
    update(dt) {
        const head = this.body[0];

        // set pivot point on valid position
        if(!(head[0] % TILE_SIZE || head[1] % TILE_SIZE) && (inputControl.currentKey+head[2])%2) {
            this.pivots.push([head[0], head[1], inputControl.currentKey]);
        }

        for(let i = 0; i < this.body.length; i++) {
            // see if a pivot point was hit, if so change the direction of the body part 
            for(let j = 0; j < this.pivots.length; j++) {
                if(this.body[i][0] === this.pivots[j][0] && this.body[i][1] === this.pivots[j][1]) {
                    this.body[i][2] = this.pivots[j][2];

                    // remove pivot if tail crossed it
                    if(i === this.body.length-1) {
                        this.pivots.splice(j, 1);
                    }
                }
            }
            // increments the x or y position in the specified direction
            this.body[i][(this.body[i][2] % 2) ? 0 : 1] += dt * (this.body[i][2] > 1 ? 1 : -1); 
        }

        // check whether we have smacked into something (AABB methodology)
        const boundaryCheck = head[0] < 0 || head[0] > (WIDTH-1)*TILE_SIZE || head[1] < 0 || head[1] > (HEIGHT-1)*TILE_SIZE;
        const cannibalCheck = this.body.slice(3,).some((part) => {
            return (head[0] < part[0]+TILE_SIZE && head[0]+TILE_SIZE > part[0]) && 
                   (head[1] < part[1]+TILE_SIZE && head[1]+TILE_SIZE > part[1]);
        });
        if(boundaryCheck || cannibalCheck) {
            this.body = [[5*TILE_SIZE, 7*TILE_SIZE, 3], [4*TILE_SIZE, 7*TILE_SIZE, 3]];
            this.pivots = [];
        }  
    },
    grow() {
        const tail = this.body[this.body.length-1];
        const dir = tail[2] > 1 ? -1 : 1;
        if(tail[2] % 2) {
            this.body.push([tail[0]+32*dir, tail[1], tail[2]]);
        } else {
            this.body.push([tail[0], tail[1]+32*dir, tail[2]]);
        }
    },
    render() {
        return (<RenderSnake body={this.body} />);
    },
}

// main game, handles snake and apple, initializes input control
class Game extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            snake: Snake,
            apple: Apple,
        };
    }

    componentDidMount() {
        inputControl.init();
        this.update();
    }

    update() {
        const snake = this.state.snake;
        const apple = this.state.apple;
        Snake.update(1);
        if(snake.body[0][0] === apple.x && snake.body[0][1] === apple.y) {
            snake.grow();
            apple.newPosition();
        }
        this.setState({snake, apple});
        requestAnimationFrame(()=>this.update());   
    }

    render() {
        return(
            <div>
                {Snake.render()}
                {Apple.render()}
            </div>
        );
    }
}

ReactDOM.render(<Game />, document.getElementById('root'));



