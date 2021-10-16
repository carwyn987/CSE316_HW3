import { createContext, useState } from 'react'
import jsTPS from '../common/jsTPS'
import api from '../api'
import MoveItem_Transaction from '../transactions/MoveItem_Transaction'
import ChangeItem_Transaction from '../transactions/ChangeItem_Transaction'
export const GlobalStoreContext = createContext({});
/*
    This is our global data store. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author McKilla Gorilla
*/

// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA STORE STATE THAT CAN BE PROCESSED
export const GlobalStoreActionType = {
    CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
    CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
    LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    SET_LIST_NAME_EDIT_ACTIVE: "SET_LIST_NAME_EDIT_ACTIVE",
    SET_ITEM_EDIT_ACTIVE: "SET_ITEM_EDIT_ACTIVE",
    INCREMENT_NEW_LIST_COUNTER: "INCREMENT_NEW_LIST_COUNTER",
    SET_LIST_FOR_DELETION: "SET_LIST_FOR_DELETION"
}

// WE'LL NEED THIS TO PROCESS TRANSACTIONS
const tps = new jsTPS();

// WITH THIS WE'RE MAKING OUR GLOBAL DATA STORE
// AVAILABLE TO THE REST OF THE APPLICATION
export const useGlobalStore = () => {
    // THESE ARE ALL THE THINGS OUR DATA STORE WILL MANAGE
    const [store, setStore] = useState({
        idNamePairs: [],
        currentList: null,
        newListCounter: 0,
        isListNameEditActive: false,
        isItemEditActive: -1,
        listMarkedForDeletion: null
    });

    // HERE'S THE DATA STORE'S REDUCER, IT MUST
    // HANDLE EVERY TYPE OF STATE CHANGE
    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            // LIST UPDATE OF ITS NAME
            case GlobalStoreActionType.CHANGE_LIST_NAME: {
                return setStore({
                    idNamePairs: payload.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: store.isItemEditActive,
                    listMarkedForDeletion: null
                });
            }
            // STOP EDITING THE CURRENT LIST
            case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: store.isItemEditActive,
                    listMarkedForDeletion: null
                })
            }
            // GET ALL THE LISTS SO WE CAN PRESENT THEM
            case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                return setStore({
                    idNamePairs: payload,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: store.isItemEditActive,
                    listMarkedForDeletion: null
                });
            }
            // UPDATE A LIST
            case GlobalStoreActionType.SET_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: -1,
                    listMarkedForDeletion: null
                });
            }
            // START EDITING A LIST NAME
            case GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: true,
                    isItemEditActive: store.isItemEditActive,
                    listMarkedForDeletion: null
                });
            }
            
            // START EDITING A LIST ITEM
            case GlobalStoreActionType.SET_ITEM_EDIT_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: payload,
                    listMarkedForDeletion: null
                });
            }

            // INCREMENT COUNTER
            case GlobalStoreActionType.INCREMENT_NEW_LIST_COUNTER: {
                return setStore({
                    idNamePairs: payload.idNamePairs,
                    currentList: payload.top5List,
                    newListCounter: store.newListCounter+1,
                    isListNameEditActive: false,
                    isItemEditActive: store.isItemEditActive,
                    listMarkedForDeletion: null
                });
            }
            
            // Set list for deletion
            case GlobalStoreActionType.SET_LIST_FOR_DELETION: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: store.isItemEditActive,
                    listMarkedForDeletion: payload
                });
            }

            default:
                return store;
        }
    }
    // THESE ARE THE FUNCTIONS THAT WILL UPDATE OUR STORE AND
    // DRIVE THE STATE OF THE APPLICATION. WE'LL CALL THESE IN 
    // RESPONSE TO EVENTS INSIDE OUR COMPONENTS.

    // THIS FUNCTION PROCESSES CHANGING A LIST NAME
    store.changeListName = function (id, newName) {
        // GET THE LIST
        async function asyncChangeListName(id) {
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;
                if(newName != ""){
                    top5List.name = newName;
                }
                async function updateList(top5List) {
                    response = await api.updateTop5ListById(top5List._id, top5List);
                    if (response.data.success) {
                        async function getListPairs(top5List) {
                            response = await api.getTop5ListPairs();
                            if (response.data.success) {
                                let pairsArray = response.data.idNamePairs;
                                storeReducer({
                                    type: GlobalStoreActionType.CHANGE_LIST_NAME,
                                    payload: {
                                        idNamePairs: pairsArray,
                                        top5List: top5List
                                    }
                                });
                            }
                        }
                        getListPairs(top5List);
                    }
                }
                updateList(top5List);
            }
        }
        asyncChangeListName(id);
    }

    // THIS FUNCTION EDITS A LIST AND UPDATES
    store.editListItem = function (id, text) {
        // Only if the text of an item was changed
        if(text != ""){
            async function getListAndEditVals(idOfList, id, text) {
                // Get the top5List from id
                let response = await api.getTop5ListById(idOfList);
                if (response.data.success) {
                    let data = response.data.top5List;

                    // Transaction
                    store.addEditItemTransaction(id, data.items[id], text);

                }
            }
            getListAndEditVals(store.currentList._id, id, text);
        }
    }

    // THIS FUNCTION PROCESSES CLOSING THE CURRENTLY LOADED LIST
    store.closeCurrentList = function () {
        tps.clearAllTransactions()
        storeReducer({
            type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
            payload: {}
        });
    }

    store.undoAvailable = function () {
        return tps.hasTransactionToUndo();
    }

    store.redoAvailable = function () {
        return tps.hasTransactionToRedo();
    }

    store.addList = function (payload) {
        // Create and send a HTTP Post request to the server with name: "UntitledN", items: "?, ?, ..."
        async function createNewList() {
            let response = await api.createTop5List({
                "name": "Untitled" + store.newListCounter,
                "items": [
                    "?",
                    "?",
                    "?",
                    "?",
                    "?"
                ]
            });
            if(response.data.success){

                // Update list pairs
                async function getListPairs(top5List) {
                    let response = await api.getTop5ListPairs();
                    if (response.data.success) {
                        let pairsArray = response.data.idNamePairs;
                        storeReducer({
                            type: GlobalStoreActionType.INCREMENT_NEW_LIST_COUNTER,
                            payload: {
                                idNamePairs: pairsArray,
                                top5List: top5List
                            }
                        });
                        // console.log("newListCounter: " + store.newListCounter)
                        store.history.push("/top5list/" + top5List._id);
                    }
                }
                // await api.updateTop5ListById(response.data.top5List._id, response.data.top5List);
                
                getListPairs(response.data.top5List)
                // store.setCurrentList(response.data.top5List._id);
            }
        }
        createNewList();
    }

    // THIS FUNCTION LOADS ALL THE ID, NAME PAIRS SO WE CAN LIST ALL THE LISTS
    store.loadIdNamePairs = function () {
        async function asyncLoadIdNamePairs() {
            const response = await api.getTop5ListPairs();
            if (response.data.success) {
                let pairsArray = response.data.idNamePairs;
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: pairsArray
                });
            }
            else {
                console.log("API FAILED TO GET THE LIST PAIRS");
            }
        }
        asyncLoadIdNamePairs();
    }

    // THE FOLLOWING 8 FUNCTIONS ARE FOR COORDINATING THE UPDATING
    // OF A LIST, WHICH INCLUDES DEALING WITH THE TRANSACTION STACK. THE
    // FUNCTIONS ARE setCurrentList, addMoveItemTransaction, addUpdateItemTransaction,
    // moveItem, updateItem, updateCurrentList, undo, and redo
    store.setCurrentList = function (id) {
        async function asyncSetCurrentList(id) {
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;

                response = await api.updateTop5ListById(top5List._id, top5List);
                if (response.data.success) {
                    storeReducer({
                        type: GlobalStoreActionType.SET_CURRENT_LIST,
                        payload: top5List
                    });
                    store.history.push("/top5list/" + top5List._id);
                }
            }
        }
        asyncSetCurrentList(id);
    }
    store.addMoveItemTransaction = function (start, end) {
        let transaction = new MoveItem_Transaction(store, start, end);
        tps.addTransaction(transaction);
    }
    store.addEditItemTransaction = function (id, oldText, newText){
        let transaction = new ChangeItem_Transaction(store, id, oldText, newText);
        tps.addTransaction(transaction);
    }

    store.setModalVisable = function (id){
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_FOR_DELETION,
            payload: id
        });
    }

    store.hideDeleteListModal = function() {
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_FOR_DELETION,
            payload: null
        });
    }

    store.deleteMarkedList = function () {
        async function deleteList(){
            async function asyncLoadIdNamePairs() {
                let response = await api.getTop5ListPairs();
                if (response.data.success) {
                    let pairsArray = response.data.idNamePairs;

                    for(let i = 0; i<pairsArray.length; i++){
                        if(pairsArray[i] != null){
                            if(pairsArray[i]._id === store.listMarkedForDeletion){
                                pairsArray.splice(i,1);
                            }
                        }
                    }
                    
                    response = await api.deleteTop5ListById(store.listMarkedForDeletion);
                    if(response.data.success){
                        storeReducer({
                            type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                            payload: pairsArray
                        });
                    }
                }
                else {
                    console.log("API FAILED TO GET THE LIST PAIRS");
                }
            }
            asyncLoadIdNamePairs();
        }
        deleteList();
    }

    store.moveItem = function (start, end) {
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = store.currentList.items[start];
            for (let i = start; i < end; i++) {
                store.currentList.items[i] = store.currentList.items[i + 1];
            }
            store.currentList.items[end] = temp;
        }
        else if (start > end) {
            let temp = store.currentList.items[start];
            for (let i = start; i > end; i--) {
                store.currentList.items[i] = store.currentList.items[i - 1];
            }
            store.currentList.items[end] = temp;
        }

        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }

    store.editItemUnRe = function (index, oldText, newText){
        async function getListAndEditVals(idOfList, id, text) {
            // Get the top5List from id
            let response = await api.getTop5ListById(idOfList);
            if (response.data.success) {
                let data = response.data.top5List;
                
                // Edit items
                data.items[id] = text;

                async function editVals(idOfList, data) {
                    let response = await api.updateTop5ListById(idOfList, data)
                    if (response.data.success) {
                        // Update current list to show update
                        storeReducer({
                            type: GlobalStoreActionType.SET_CURRENT_LIST,
                            payload: data
                        });
                        // store.history.push("/top5list/" + top5List._id);
                    }
                }
                editVals(idOfList, data);
            }
        }
        getListAndEditVals(store.currentList._id, index, newText);
    }

    store.updateCurrentList = function() {
        async function asyncUpdateCurrentList() {
            const response = await api.updateTop5ListById(store.currentList._id, store.currentList);
            if (response.data.success) {
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: store.currentList
                });
            }
        }
        asyncUpdateCurrentList();
    }
    store.undo = function () {
        tps.undoTransaction();
    }
    store.redo = function () {
        tps.doTransaction();
    }

    // THIS FUNCTION ENABLES THE PROCESS OF EDITING A LIST NAME
    store.setIsListNameEditActive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
            payload: null
        });
    }

    store.setIsItemEditActive = function (index) {
        storeReducer({
            type: GlobalStoreActionType.SET_ITEM_EDIT_ACTIVE,
            payload: index
        });
    }

    // THIS GIVES OUR STORE AND ITS REDUCER TO ANY COMPONENT THAT NEEDS IT
    return { store, storeReducer };
}