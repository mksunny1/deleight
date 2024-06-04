import { Actribute } from '../../src/actribute.js'
import { update } from '../../src/queryoperator.js'
import { items, range, repeat } from '../../src/generational.js'

const [ status, board, history ] = document.querySelectorAll('#board, #status, #history');
const historyItem = document.getElementById('historyItem').content.firstElementChild;
const historyItemButton = historyItem.firstElementChild;
const act = new Actribute();
const vars = {};          // state 1.
const arrayVars = {};     // state 2.

act.register({
    rep: (element, nReps, context) => {
        const reps = context[nReps.value];
        const parentNode = element.parentNode;
        if (parentNode.children.length === 1) element.setAttribute('i-ndex', 0);
        if (parentNode.children.length < reps) {
            const clone = element.cloneNode(true);
            clone.setAttribute('i-ndex', parentNode.children.length);
            parentNode.appendChild(clone);
        } else if (parentNode.children.length > reps) {
            parentNode.lastElementChild.remove();
        }
        if (element instanceof HTMLSpanElement) {
            element.textContent = ''; element.removeAttribute('p-layed');
        }
    }
})

function start() {
    const inputs = document.querySelectorAll('input');
    let [nRows, nCols, players, winCount] = Array.prototype.map.call(inputs, input => input.value);
    nRows = parseInt(nRows); nCols = parseInt(nCols); winCount = parseInt(winCount);

    // generate squares:
    const squares = [];
    let i = nRows; while (i-- > 0) squares.push(Array(nCols));
    act.process({ el: board, ctx: [{ nRows, nCols }], attr: 'a-' });

    players = players.split(' ');     // players are split by spaces.
    const nextPlayer = repeat(range(0, players.length));

    Object.assign(vars, { players, squares, nextPlayer, move: 0, nRows, nCols, winCount });
    Object.assign(arrayVars, {
        moves: [], nextPlayer: [nextPlayer.next().value],
        winner: Array(1), historyText: ['game start']
    });

    updateHistory();
    display();
}
document.getElementById('startButton').onclick = (e) => start();
board.onclick = (e) => { play(e) }
history.onclick = (e) => {
    vars.move = parseInt(e.target.getAttribute('m-ove')); 
    let player, row, col, square; 
    for (let i = 0; i < arrayVars.moves.length; i++) {
        [player, row, col] = arrayVars.moves[i];
        vars.squares[row][col] = (i < vars.move)? player: '';
        square = board.children[row].children[col];
        square.textContent = (i < vars.move)? player: '';
        square.setAttribute('p-layed', (i < vars.move)? 'true': '')
    }
    display();
}

function updateHistory() {
    historyItemButton.setAttribute('m-ove', vars.move);
    historyItemButton.textContent = 'Go to ' + arrayVars.historyText[vars.move];
    update(items(history.children, range(vars.move, history.children.length)),
        [historyItem.cloneNode(true), history.lastElementChild]);
}

function display() {
    if (arrayVars.winner[vars.move]) status.textContent = `Winner: ${arrayVars.winner[vars.move]}`
    else status.textContent = `Next Player: ${vars.players[arrayVars.nextPlayer[vars.move]]}`
}

function play(e) {
    // 1. if a winner already exists return
    if (arrayVars.winner[vars.move] !== undefined) return;

    // also exit if square has been played earlier:
    if (e.target.getAttribute('p-layed')) return;
    else e.target.setAttribute('p-layed', 'true');

    // 3. compute row and col.
    const col = parseInt(e.target.getAttribute('i-ndex'));
    const row = parseInt(e.target.parentNode.getAttribute('i-ndex'));
    const player = vars.players[arrayVars.nextPlayer[vars.move]];

    // 4. check for winner.
    const lines = [[[-1, 0], [1, 0]], [[0, -1], [0, 1]], [[-1, -1], [1, 1]], [[-1, 1], [1, -1]]]
    let winner, x, y, xOffset, yOffset, count;
    for (let line of lines) {
        count = 1;
        for ([xOffset, yOffset] of line) {
            x = row + xOffset; y = col + yOffset;
            while (x >= 0 && x < vars.nRows && y >= 0 && y < vars.nCols) {
                if (vars.squares[x][y] !== player) break;
                else count++;
                x += xOffset; y += yOffset;
            }
            if (count >= vars.winCount) { winner = player; break }
        }
        if (count >= vars.winCount) break;
    }

    // 5. update vars
    arrayVars.moves.length = ++vars.move;
    if (arrayVars.nextPlayer[vars.move] === undefined) {
        arrayVars.nextPlayer[vars.move] = vars.nextPlayer.next().value;
    }
    arrayVars.historyText[vars.move] = `move #${vars.move}`;
    vars.squares[row][col] = player;
    arrayVars.moves[vars.move - 1] = [player, row, col];
    board.children[row].children[col].textContent = player;
    if (winner !== undefined) arrayVars.winner[vars.move] = winner;
    else arrayVars.winner.length = vars.move;   // this is important!

    updateHistory();
    display()
}
