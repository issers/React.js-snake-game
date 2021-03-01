

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

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

function Apple(props) {
    return(
        <div className="apple"
            style={{
                left: props.x,
                top: props.y,
            }}>
        </div>
    );
}

class Snake extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pivots: [], //[[x, y, dir]], dir = [up:0, left:1, down:2, right:3]
            body: [[5*32, 7*32, 3], [4*32, 7*32, 3], [3*32, 7*32, 3], [2*32, 7*32, 3]], //[[x, y, dir]], body[0] = head, body[body.length-1] = tail
            apple: [Math.floor(Math.random() * 20) * 32, Math.floor(Math.random() * 15) * 32],
        };
    }

    componentDidMount() {
        window.addEventListener('keydown', (e) => movKey.insert(e.code));
        window.addEventListener('keyup', (e) => movKey.delete(e.code));  
        requestAnimationFrame(() => this.update());
    }

    update() {
        this.setPivot();
        let updatedPivots = this.state.pivots;
        let updatedBody = this.state.body;
        let apple = this.state.apple;
        
        for(let i = 0; i < updatedBody.length; i++) {

            // check if we ate an apple, update accordingly
            if(updatedBody[0][0] === apple[0] && updatedBody[0][1] === apple[1]) {
                const tail = updatedBody[updatedBody.length-1];
                if(tail[2] === 0) {
                    updatedBody.push([tail[0], tail[1]+32, 0]);
                } else if(tail[2] === 1) {
                    updatedBody.push([tail[0]+32, tail[1], 1]);
                } else if(tail[2] === 2) {
                    updatedBody.push([tail[0], tail[1]-32, 2]);
                } else if(tail[2] === 3) {
                    updatedBody.push([tail[0]-32, tail[1], 3]);
                }
                apple[0] = Math.floor(Math.random() * 20) * 32;
                apple[1] = Math.floor(Math.random() * 15) * 32;
            }

            // pivot each element around a point
            for(let j = 0; j < updatedPivots.length; j++) {
                if(updatedBody[i][0] === updatedPivots[j][0] && updatedBody[i][1] === updatedPivots[j][1]) {
                    updatedBody[i][2] = updatedPivots[j][2];
                    if(i === updatedBody.length-1) {
                        updatedPivots.splice(j, 1);
                    }
                }
            }
            this.updateCoords(updatedBody[i]);
        }



        this.setState({
            body:updatedBody, 
            pivots:updatedPivots, 
            apple:apple
        });

        // did we smack into something?
        this.checkValidMove();

        requestAnimationFrame(() => this.update());
    }

    setPivot() {
        // set pivot point
        const head = this.state.body[0];
        let updatedPivots = this.state.pivots;

        if(!(head[0] % 32 || head[1] % 32)) {
            const key = movKey.get();

            // is our input valid? (cannot go opposite direction)
            if(key === 0 && head[2] !== 2) {
                updatedPivots.push([head[0], head[1], 0]);
            } else if(key === 2 && head[2] !== 3) {
                updatedPivots.push([head[0], head[1], 1]);
            } else if(key === 4 && head[2] !== 0) {
                updatedPivots.push([head[0], head[1], 2]);
            } else if(key === 6 && head[2] !== 1) {
                updatedPivots.push([head[0], head[1], 3]);
            }
            this.setState({pivots:updatedPivots});
        }
    }

    // update snake component x,y
    updateCoords(coordPair) {
        if(coordPair[2] === 0) {
            coordPair[1]-=1;
        } else if(coordPair[2] === 1) {
            coordPair[0]-=1;
        } else if(coordPair[2] === 2) {
            coordPair[1]+=1;
        } else if(coordPair[2] === 3) {
            coordPair[0]+=1;
        }
    }

    checkValidMove() {
        const head = this.state.body[0];
        const boundaryCheck = head[0] < 0 || head[0] > 608 || head[1] < 0 || head[1] > 448;
        const cannibalCheck = this.state.body.slice(3,).some((part) => {
            return (head[0] < part[0]+32 && head[0]+32 > part[0]) && 
                   (head[1] < part[1]+32 && head[1]+32 > part[1]);
        });
        if(boundaryCheck || cannibalCheck) {
            this.setState({ 
                pivots: [], 
                body: [[5*32, 7*32, 3], [4*32, 7*32, 3], [3*32, 7*32, 3], [2*32, 7*32, 3]], 
                apple: [Math.floor(Math.random() * 20) * 32, Math.floor(Math.random() * 15) * 32]
            });
        } 
    }


    render() {
        const body = this.state.body;
        const apple = this.state.apple;
        let parts = body.map((part, index) => {
            return part = <SnakePart 
                key = {index}
                x={body[index][0] + (!index ? 0 : 1)} 
                y={body[index][1] + (!index ? 0 : 1)} 
                bodyPart={!index ? "head" : "body"}/>
        });
        parts.push(<Apple key={parts.length} x={apple[0]} y={apple[1]}/>);

        return(
            parts
        );
    }
}

// =======================================================
ReactDOM.render(<Snake />, document.getElementById('root'));


// =======================================================
function keyToIndex(key) {
    if(key === 'KeyW' || key === 'ArrowUp') {
        return 0;
    } else if(key === 'KeyA' || key === 'ArrowLeft') {
        return 2;
    } else if(key === 'KeyS' || key === 'ArrowDown') {
        return 4;
    } else if(key === 'KeyD' || key === 'ArrowRight') {
        return 6;
    }
    return -1;
}

// make this a typed array or something
// let arr = new UInt8Array(4) --> an array of 4, 1 byte (8 bit) unsigned ints
//
// let buffer = new ArrayBuffer(4)   --> allocate 4 bytes
// let arr = new UInt8Array(buffer)  --> connect those 4 bytes to this array of 4 elements, 1 byte per element
//
// or for another example...
//
// let buffer = new ArrayBuffer(4)   --> allocate 4 bytes
// let arr = new UInt32Array(buffer) --> now this array only has 1 byte, 1 element (cause 32 bits = 4 bytes, which then takes up all the space in the 4 byte buffer)
//
let movKey = {
    arr: new Int8Array(8),  // arr[key] = previous_, arr[key+1] = next_...
    max: -1,
    insert(key) {
        let index = keyToIndex(key);
        if(index > -1 && index !== this.max) {
            this.arr[index] = this.max;
            this.arr[index+1] = -1;

            if(this.max > -1) {
                this.arr[this.max+1] = index;
            }
            this.max = index;
        }
    },
    delete(key) {
        let index = keyToIndex(key);
        if(index > -1) {
            let prev = this.arr[index];
            let next = this.arr[index+1];

            this.arr[prev+1] = next;
            this.arr[next] = prev;

            if(this.max === index) {
                this.arr[prev+1] = -1;
                this.max = prev;
            }

            this.arr[index] = -1;
            this.arr[index+1] = -1;
        }
    },
    get: function() {
        return this.max;
    }
};










