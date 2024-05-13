
const history = Array(9).fill(null);
let currentMove = 0;
const xIsNext = () => !(currentMove % 2);
const currentSquares = () => history[currentMove];

function handlePlay(nextSquares) {
    
}