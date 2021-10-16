import { useContext } from 'react'
import { GlobalStoreContext } from '../store'
import { useHistory } from 'react-router-dom'
/*
    This toolbar is a functional React component that
    manages the undo/redo/close buttons.
    
    @author McKilla Gorilla
*/
function EditToolbar() {
    const { store } = useContext(GlobalStoreContext);
    const history = useHistory();

    let enabledButtonClass = "top5-button";
    let undoEnabledButtonClass = "top5-button";
    let redoEnabledButtonClass = "top5-button";

    // if edit view
    if(!store.currentList){
        undoEnabledButtonClass += " disabled";
        redoEnabledButtonClass += " disabled";
        enabledButtonClass += " disabled";
    }else{
        enabledButtonClass = "top5-button";
    }

    // if undo available
    if(!store.undoAvailable()){
        undoEnabledButtonClass += " disabled";
    }else{
        undoEnabledButtonClass = "top5-button";
    }

    // if redo available
    if(!store.redoAvailable()){
        redoEnabledButtonClass += " disabled";
    }else{
        redoEnabledButtonClass = "top5-button";
    }

    function handleUndo() {
        store.undo();
    }
    function handleRedo() {
        store.redo();
    }
    function handleClose() {
        history.push("/");
        store.closeCurrentList();
    }
    let editStatus = false;
    if (store.isListNameEditActive) {
        editStatus = true;
    }
    return (
        <div id="edit-toolbar">
            <div
                disabled={editStatus}
                id='undo-button'
                onClick={handleUndo}
                className={undoEnabledButtonClass}>
                &#x21B6;
            </div>
            <div
                disabled={editStatus}
                id='redo-button'
                onClick={handleRedo}
                className={redoEnabledButtonClass}>
                &#x21B7;
            </div>
            <div
                disabled={editStatus}
                id='close-button'
                onClick={handleClose}
                className={enabledButtonClass}>
                &#x24E7;
            </div>
        </div>
    )
}

export default EditToolbar;