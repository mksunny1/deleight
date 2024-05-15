import { Actribute } from '../../src/actribute.js'
import { apply } from '../../src/appliance.js'

const act = new Actribute({}, 'a-');

act.registerAll({
    rep: (element, nReps) => {
        element.parentNode.textContent = '';
        while (nReps-- > 0) {
            element.parentNode.appendChild(element.cloneNode(true));
        }
    }
})

const history = [];
let lastMove = 0;

function setMove(move) {
    if (move == history.length) history.push(lastMove = move);
    else if (move > history.length) lastMove = move;
    else {

    }
}

function play(player, square) {
    ++lastMove && history.push([player, square]) && (square.textContent = player);
} 

function replay(moves) {

}

function start(main) { 
    const [ nRows, nCols, players ] = 
    Array.map.call(main.querySelectorAll('£nRows, £nCols, £players'), 
        input => input.value);
    act.process(main, { nRows, nCols });

    players = players.split(' ');
    
    let currentPlayer = 0;

    const nextPlayer = () => {
        if (++currentPlayer >= players.length) currentPlayer = 0;
    }

    function gameOver() {

    }

    apply({
        '#board': board => board.onclick = (e) => {
            const square = e.target;
            (square.textContent = players[currentPlayer] || 1) && (gameOver() || nextPlayer());
        }
    }, main);
}

apply({
    main: main => {
        start(main)
        apply({
            '#start': btn => btn.onclick = () => start(main)
        }, main);
    },
})
