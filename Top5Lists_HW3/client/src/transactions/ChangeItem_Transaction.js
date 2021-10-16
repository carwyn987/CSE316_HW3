import jsTPS_Transaction from "../common/jsTPS.js"
/**
 * ChangeItem_Transaction
 * 
 * This class represents a transaction that works with edit list item.
 *  It will be managed by the transaction stack.
    
    @author McKilla Gorilla
 */
export default class ChangeItem_Transaction extends jsTPS_Transaction {
    constructor(initStore, initIndex, oldText, newText) {
        super();
        this.store = initStore;
        this.initIndex = initIndex;
        this.oldText = oldText;
        this.newText = newText;
    }

    doTransaction() {
        this.store.editItemUnRe(this.initIndex, this.oldText, this.newText);
    }
    
    undoTransaction() {
        this.store.editItemUnRe(this.initIndex, this.newText, this.oldText);
    }
}