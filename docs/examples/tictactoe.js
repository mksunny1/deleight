import { Actribute } from '../../src/actribute.js'
import { apply } from '../../src/appliance.js'

const act = new Actribute({}, 'a-');

act.register('rep', (node, nReps) => {
    while (nReps-- > 0) {
        node.parentNode.insertBefore(node.cloneNode(true));
    }
}).register;

function start(nRows = 3, nCols = 3) {
    
}

apply({
    main: main => {
        act.process(main, {
            nRows, nCols
        });
    }
})

