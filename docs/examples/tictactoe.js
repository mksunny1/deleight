import { Actribute } from '../../src/actribute.js'
import { apply } from '../../src/appliance.js'
import { one } from '../../src/onetomany.js'
import { insert, set } from '../../src/domitory.js'


const vars = {};     // state.
const board = document.getElementById('board');
const status = document.getElementById('status');
const history = document.getElementById('history');
const historyItem = document.getElementById('historyItem').content.firstElementChild;
const historyItemButton = historyItem.firstElementChild;

history.onclick = (e) => {
    vars.move = parseInt(e.target.getAttribute('m-ove'));
    display();
}

function start() {
    const [ nRows, nCols, players ] = 
        Array.map.call(main.querySelectorAll('£nRows, £nCols, £players'), 
                       input => input.value);
                       
    const squares = [];
    let rows = nRows, row, col;
    while ( rows-- > 0 ) {
        rows.push(row = []);
        for ( col = 0; col++ < nCols; ) row.push(Array(1))
    }

    players = players.split(' ');
    Object.assign(vars, {
        squares, players, nextPlayer: [players[0]], 
        winner: Array(1), move: 0, nRows, nCols
    });
    historyItemButton.setAttribute('m-ove', '0');
    historyItemButton.textContent = 'Go to game start'
    history.appendChild(historyItem.cloneNode(true))
    display();
}

function display() {
    const pos = vars.move;
    let row, col, rowVar, rowElement;
    for (row = 0; row < vars.nRows; row++) {
        rowVar = vars.squares[row];
        rowElement = board.children[row];
        for (col = 0; col < vars.nCols; col++) {
            rowElement.children[col].textContent = rowVar[col][pos];
        }
    }
    if (vars.winner[pos]) status.textContent = `Winner: ${vars.winner[pos]}`
    else status.textContent = `Next Player: ${vars.nextPlayer[pos]}`
}

function play(e) {
    const pos = vars.move;

    // 1. if a winner already exists return
    if (vars.winner[pos]) return; 

    // 2. splice any vars beyond current move
    if (vars.nextPlayer.length > pos + 1) {
        pos++;
        vars.nextPlayer.length = pos
        vars.winner.length = pos
        let row, col, i;
        for (row of vars.squares) for (col of row) col.length = pos;
        for ( i = vars.nextPlayer.length; i > pos; i-- ) history.removeChild(history.lastElementChild);
        pos--;
    }

    // 3. compute row and col.

    // 4. push new vars (including new history view entry)

    

    // 5. check for winner.

    // 6. if winner update current winner value else increment move variable

    // 7. display.

}

function jumpTo(move) {
    // 1. set value of move

    // 2. disolay.

}

