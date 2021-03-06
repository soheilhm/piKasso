import undoable, { includeAction } from "redux-undo";
import * as actionTypes from "../constants/actionTypes/canvasBlocks";
import * as itemTypes from '../constants/itemTypes/itemTypes';
import generateID from "../common/uuid";

const blockItemTypes = ['A', 'B', 'C', 'D', 'E'];

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function _generateRandomBlockData(id) {
    let columns = [];
    const columnNum = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < columnNum; ++i) {
        const blockItem = blockItemTypes[Math.floor(Math.random() * blockItemTypes.length)];
        columns.push({
            columnIdx: Math.random().toString(36).substring(7),
            size: columnNum === 1 ? "1" :`1/${columnNum}`,
            type: blockItem,
            background: getRandomColor(),
            content: `${blockItem}`
        })
    }

    return JSON.stringify({
        blockID: id,
        backgroundColor: getRandomColor(),
        columnNum,
        paddingTop: 20,
        paddingBottom: 20,
        columns
    });
}

const initialCustomizedBlocks = [
    {
        index: "6fbe4417-57f7-4758-85d2-a2ef8e517dba",
        type: itemTypes.CUSTOMIZED_BLOCK,
        title: "Block1",
        content: _generateRandomBlockData("6fbe4417-57f7-4758-85d2-a2ef8e517dba"),
    },

    {
        index: "661b20e7-23c3-4505-a74d-c2f370993caf",
        type: itemTypes.CUSTOMIZED_BLOCK,
        title: "Block3",
        content: _generateRandomBlockData("661b20e7-23c3-4505-a74d-c2f370993caf"),
    },

    {
        index: "cdaf1bd7-1811-4255-9a0b-584779826380",
        type: itemTypes.CUSTOMIZED_BLOCK,
        title: "Block5",
        content: _generateRandomBlockData("cdaf1bd7-1811-4255-9a0b-584779826380"),
    },
    {
        index: "c059b491-624a-4b64-a6f7-b8fa00baa79c",
        type: itemTypes.CUSTOMIZED_BLOCK,
        title: "Block7",
        content: _generateRandomBlockData("c059b491-624a-4b64-a6f7-b8fa00baa79c"),
    }
];

const updateWithNewColumnIDs = (content) => {
    const data = JSON.parse(content);
    data.columns.forEach(column => column.columnIdx = Math.random().toString(36).substring(7));
    return JSON.stringify(data);
};

const canvasBlocks = (state = initialCustomizedBlocks, action) => {
    let draftState = state;
    switch (action.type) {
        case actionTypes.ADD_BLOCK:
            (() => {
                const block = action.payload;
                draftState = [
                    ...draftState,
                    { ...block, content: updateWithNewColumnIDs(block.content), index: generateID(), type: itemTypes.CUSTOMIZED_BLOCK }
                ];
            })();
            return draftState;

        case actionTypes.DUPLICATE_BLOCK:
            (() => {
                const block = action.payload;
                const idx = draftState.indexOf(block);
                draftState = [
                    ...draftState.slice(0, idx + 1),
                    { ...block, content: updateWithNewColumnIDs(block.content), index: generateID(), type: itemTypes.CUSTOMIZED_BLOCK },
                    ...draftState.slice(idx + 1)
                ];
            })();
            return draftState;

        case actionTypes.REMOVE_BLOCK:
            (() => {
                const block = action.payload;
                draftState = [...draftState.filter(elm => elm !== block)];
            })();
            return draftState;

        case actionTypes.MOVE_UP_BLOCK:
            (() => {
                const block = action.payload;
                const idx = draftState.indexOf(block);
                if (idx > 0) {
                    const prevBlock = draftState[idx - 1];
                    draftState = [
                        ...draftState.slice(0, idx - 1),
                        { ...block, type: itemTypes.CUSTOMIZED_BLOCK },
                        { ...prevBlock },
                        ...draftState.slice(idx + 1)
                    ];
                }
            })();
            return draftState;

        case actionTypes.MOVE_DOWN_BLOCK:
            (() => {
                const block = action.payload;
                const idx = draftState.indexOf(block);
                if (idx < draftState.length - 1) {
                    const nextBlock = draftState[idx + 1];
                    draftState = [
                        ...draftState.slice(0, idx),
                        { ...nextBlock },
                        { ...block, type: itemTypes.CUSTOMIZED_BLOCK },
                        ...draftState.slice(idx + 2)
                    ];
                }
            })();
            return draftState;

        case actionTypes.SWAP_BLOCKS:
            (() => {
                const { draggedBlockIdx, droppedPosition, droppedBlockIdx } = action.payload;
                if (draggedBlockIdx !== droppedBlockIdx) {
                    const draggedBlock = draftState.filter(elm => elm.index === draggedBlockIdx)[0];
                    const droppedBlock = draftState.filter(elm => elm.index === droppedBlockIdx)[0];
                    const tempState = draftState.filter((elm) => elm.index !== draggedBlock.index);
                    const dropIdx = tempState.indexOf(droppedBlock);
                    if (droppedPosition === 'before') {
                        draftState = [
                            ...tempState.slice(0, dropIdx),
                            { ...draggedBlock, type: itemTypes.CUSTOMIZED_BLOCK },
                            ...tempState.slice(dropIdx)
                        ];
                    } else {
                        draftState = [
                            ...tempState.slice(0, dropIdx + 1),
                            { ...draggedBlock, type: itemTypes.CUSTOMIZED_BLOCK },
                            ...tempState.slice(dropIdx + 1)
                        ];
                    }
                }
            })();
            return draftState;

        case actionTypes.INSERT_NEW_BLOCK:
            (() => {
                const { droppedBlockIdx, droppedPosition, block } = action.payload;
                const droppedBlock = state.filter(elm => elm.index === droppedBlockIdx)[0];
                const dropIdx = state.indexOf(droppedBlock);
                if (droppedPosition === 'before') {
                    draftState = [
                        ...state.slice(0, dropIdx),
                        { ...block, content: updateWithNewColumnIDs(block.content), index: generateID(), type: itemTypes.CUSTOMIZED_BLOCK },
                        ...state.slice(dropIdx)
                    ];
                } else {
                    draftState = [
                        ...state.slice(0, dropIdx + 1),
                        { ...block, content: updateWithNewColumnIDs(block.content), index: generateID(), type: itemTypes.CUSTOMIZED_BLOCK },
                        ...state.slice(dropIdx + 1)
                    ];
                }
            })();
            return draftState;

        case actionTypes.SWAP_BLOCK_ITEMS:
            (() => {
                const { draggedItem, droppedItem } = action.payload;
                const { draggedBlockIndex, draggedColumnIdx, draggedContent, draggedBackground, draggedType } = draggedItem;
                const { droppedBlockIndex, droppedColumnIdx, droppedContent, droppedBackground, droppedType } = droppedItem;
                const draggedBlock = draftState.filter(elm => elm.index === draggedBlockIndex)[0];
                const droppedBlock = draftState.filter(elm => elm.index === droppedBlockIndex)[0];
                const dragIdx = draftState.indexOf(draggedBlock);
                const dropIdx = draftState.indexOf(droppedBlock);
                let draggedBlockContent = JSON.parse(draggedBlock.content);
                let droppedBlockContent = JSON.parse(droppedBlock.content);

                if (draggedBlockIndex === droppedBlockIndex) {
                    draggedBlockContent.columns.forEach((column) => {
                        if (column.columnIdx === draggedColumnIdx) {
                            column.type = droppedType; 
                            column.content = droppedContent;
                            column.background = droppedBackground;
                        } else if (column.columnIdx === droppedColumnIdx) {
                            column.type = draggedType; 
                            column.content = draggedContent;
                            column.background = draggedBackground;
                        }
                    });
                    draftState = [
                        ...draftState.slice(0, dropIdx),
                        {
                            ...droppedBlock,
                            content: JSON.stringify(draggedBlockContent),
                        },
                        ...draftState.slice(dropIdx + 1)
                    ];
                } else {
                    draggedBlockContent.columns.forEach((column) => {
                        if (column.columnIdx === draggedColumnIdx) {
                            column.type = droppedType;                            
                            column.content = droppedContent;
                            column.background = droppedBackground;
                        }
                    });
                    droppedBlockContent.columns.forEach((column) => {
                        if (column.columnIdx === droppedColumnIdx) {
                            column.type = draggedType; 
                            column.content = draggedContent;
                            column.background = draggedBackground;
                        }
                    });

                    const tempState = [
                        ...draftState.slice(0, dragIdx),
                        {
                            ...draggedBlock,
                            content: JSON.stringify(draggedBlockContent),
                        },
                        ...draftState.slice(dragIdx + 1)
                    ];
                    draftState = [
                        ...tempState.slice(0, dropIdx),
                        {
                            ...droppedBlock,
                            content: JSON.stringify(droppedBlockContent),
                        },
                        ...tempState.slice(dropIdx + 1)
                    ];
                }
            })();
            return draftState;
        case actionTypes.SPLIT_BLOCK_ITEM:
            (() => {
                const { blockIndex, columnIdx } = action.payload;
                const block = draftState.filter(elm => elm.index === blockIndex)[0];
                const idx = draftState.indexOf(block);
                let columnIterationIndex, targetColumn;
                const content = JSON.parse(block.content);
                content.columns.forEach((column, index) => {
                    if (column.columnIdx === columnIdx) {
                        columnIterationIndex = index;
                        targetColumn = column;
                    }
                });

                switch (content.columnNum) {
                    case 1:
                        content.columnNum = 2;
                        content.columns = [
                            {...targetColumn, columnIdx: Math.random().toString(36).substring(7), size: '1/2'},
                            {...targetColumn, columnIdx: Math.random().toString(36).substring(7), size: '1/2'}
                        ]
                        break;
                    case 2:
                        if (targetColumn.size === '1/2') {
                            content.columnNum = 3;
                            content.columns = [
                                ...content.columns.slice(0, columnIterationIndex),
                                {...targetColumn, columnIdx: Math.random().toString(36).substring(7), size: '1/4'},
                                {...targetColumn, columnIdx: Math.random().toString(36).substring(7), size: '1/4'},
                                ...content.columns.slice(columnIterationIndex + 1)
                            ];
                        } else if (targetColumn.size === '3/4') {
                            content.columnNum = 3;
                            content.columns = [
                                ...content.columns.slice(0, columnIterationIndex),
                                {...targetColumn, columnIdx: Math.random().toString(36).substring(7), size: '1/2'},
                                {...targetColumn, columnIdx: Math.random().toString(36).substring(7), size: '1/4'},
                                ...content.columns.slice(columnIterationIndex + 1)
                            ];
                        }
                        break;
                    case 3:
                        content.columnNum = 4;
                        content.columns = [
                            ...content.columns.slice(0, columnIterationIndex),
                            {...targetColumn, columnIdx: Math.random().toString(36).substring(7), size: '1/4'},
                            {...targetColumn, columnIdx: Math.random().toString(36).substring(7), size: '1/4'},
                            ...content.columns.slice(columnIterationIndex + 1)
                        ];
                        content.columns.map((column) => {
                            column.size = '1/4';
                            return column;
                        });
                        break;
                    default:
                }
                draftState = [
                    ...draftState.slice(0, idx),
                    { ...block, content: JSON.stringify(content), index: generateID() },
                    ...draftState.slice(idx + 1)
                ];

            })();
            return draftState;

        case actionTypes.MERGE_BLOCK_ITEMS:
            (() => {
                const { blockIndex, columnIdx } = action.payload;
                const block = draftState.filter(elm => elm.index === blockIndex)[0];
                const idx = draftState.indexOf(block);
                let columnIterationIndex, targetColumn;
                const content = JSON.parse(block.content);
                content.columns.forEach((column, index) => {
                    if (column.columnIdx === columnIdx) {
                        columnIterationIndex = index;
                        targetColumn = column;
                    }
                });
                if (!content.columns[columnIterationIndex +1] || targetColumn.type !== content.columns[columnIterationIndex +1].type) {
                    return draftState; // no next item to merge with or next item is different type than current item
                }

                switch (content.columnNum) {
                    case 1:
                        return draftState;
                    case 2:
                        content.columnNum = 1;
                        content.columns = [{...targetColumn, columnIdx: Math.random().toString(36).substring(7), size: '1'} ];
                        break;
                    case 3:
                        content.columnNum = 2;
                        content.columns = [
                            ...content.columns.slice(0, columnIterationIndex),
                            {...targetColumn, columnIdx: Math.random().toString(36).substring(7), size: '1/2'},
                            ...content.columns.slice(columnIterationIndex + 2)
                        ];
                        content.columns.map((column) => {
                            column.size = '1/2';
                            return column;
                        });
                        break;
                    case 4:
                        content.columnNum = 3;
                        content.columns = [
                            ...content.columns.slice(0, columnIterationIndex),
                            {...targetColumn, columnIdx: Math.random().toString(36).substring(7), size: '1/3'},
                            ...content.columns.slice(columnIterationIndex + 2)
                        ];
                        content.columns.map((column) => {
                            column.size = '1/3';
                            return column;
                        });
                        break;
                    default:
                }

                draftState = [
                    ...draftState.slice(0, idx),
                    { ...block, content: JSON.stringify(content), index: generateID() },
                    ...draftState.slice(idx + 1)
                ];

            })();
            return draftState;

        default:
            return draftState;
    }
};

export default undoable(canvasBlocks, {
    canvasBlocks: includeAction([
        actionTypes.ADD_BLOCK,
        actionTypes.DUPLICATE_BLOCK,
        actionTypes.REMOVE_BLOCK,
        actionTypes.MOVE_UP_BLOCK,
        actionTypes.MOVE_DOWN_BLOCK,
        actionTypes.SWAP_BLOCK_ITEMS,
        actionTypes.SPLIT_BLOCK_ITEM,
        actionTypes.MERGE_BLOCK_ITEMS
    ])
});
