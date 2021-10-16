import { React, useContext, useState } from "react";
import { GlobalStoreContext } from '../store'
/*
    This React component represents a single item in our
    Top 5 List, which can be edited or moved around.
    
    @author McKilla Gorilla
*/
function Top5Item(props) {
    const { store } = useContext(GlobalStoreContext);
    const [draggedTo, setDraggedTo] = useState(0);
    const [ editActive, setEditActive ] = useState(false);
    const [ text, setText ] = useState("");
    const [curElEdit, setCurElEdit] = useState({});

    function handleToggleEdit(event){
        setCurElEdit(event.target);
        event.stopPropagation();
        toggleEdit();
    }

    function toggleEdit() {
        let newActive = !editActive;
        if (newActive) {
            store.setIsItemEditActive(index);
        }else{
            store.setIsItemEditActive(-1); 
        }
        setEditActive(newActive);
    }

    function handleKeyPress(event) {
        if (event.code === "Enter") {
            store.editListItem(curElEdit.id.slice(-1), text);
            toggleEdit();
        }
    }

    function handleUpdateText(event) {
        setText(event.target.value);
    }

    function handleDragStart(event) {
        if(store.isItemEditActive === -1){
            event.dataTransfer.setData("item", event.target.id);
        }
    }

    function handleDragOver(event) {
        if(store.isItemEditActive === -1){
            event.preventDefault();
        }
    }

    function handleDragEnter(event) {
        if(store.isItemEditActive === -1){
            event.preventDefault();
            setDraggedTo(true);
        }
    }

    function handleDragLeave(event) {
        if(store.isItemEditActive === -1){
            event.preventDefault();
            setDraggedTo(false);
        }
    }

    function handleDrop(event) {
        event.preventDefault();
        let target = event.target;
        let targetId = target.id;
        targetId = targetId.substring(target.id.indexOf("-") + 1);
        let sourceId = event.dataTransfer.getData("item");
        sourceId = sourceId.substring(sourceId.indexOf("-") + 1);
        setDraggedTo(false);

        // UPDATE THE LIST
        store.addMoveItemTransaction(sourceId, targetId);
    }

    let { index } = props;
    let itemClass = "top5-item";
    if (draggedTo) {
        itemClass = "top5-item-dragged-to";
    }

    let classNameVal = "list-card-button";
    if(store.isItemEditActive != -1){
        classNameVal += " disabled"
    }

    let cardElement = 
        <div
            id={'item-' + (index + 1)}
            className={itemClass}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            draggable="true"
        >
            <input
                type="button"
                id={"edit-item-" + index}
                className={classNameVal}
                onClick={handleToggleEdit}
                value={"\u270E"}
            />
            {props.text}
        </div>;

    if (editActive) {
        cardElement =
            <input
                id={"input-card"}
                className='input-card' //edit-items
                type='text'
                onKeyPress={handleKeyPress}
                onChange={handleUpdateText}
                defaultValue={props.text}
                autoFocus
            />
}

    return (cardElement);
}

export default Top5Item;