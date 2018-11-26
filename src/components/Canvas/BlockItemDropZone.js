import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DropTarget } from "react-dnd";
import * as canvasActions from '../../actions/index';
import * as itemTypes from '../../constants/itemTypes/itemTypes';

class BlockItemDropZone extends Component {
    render() {
        const { isOverCurrent, shouldRender, isOverBlockItem, connectDropTarget } = this.props;

        if (!shouldRender) {
            return null;
        }

        return connectDropTarget(
            <div
                style={{
                    display: isOverBlockItem ? 'block' : 'none',
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    border: isOverCurrent ? '4px dashed orange' : '4px dashed lightgray',
                    background: isOverCurrent ? "repeating-linear-gradient(45deg, white, white 5px, orange 5px, orange 10px)" : "repeating-linear-gradient(45deg, white, white 5px, lightgray 5px, lightgray 10px)"
                }}
            >
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        draggedElement: state.draggedElement.present
    };
};

export default DropTarget(itemTypes.CUSTOMIZED_BLOCK_CHILD,
    {
        canDrop: (props) => true,
        drop: (props, _, connect) => {
            const state = connect.context.store.getState();
            const draggedElement = state.draggedElement.present;
            if (draggedElement.type === itemTypes.CUSTOMIZED_BLOCK_CHILD && draggedElement.source === itemTypes.ITEM_SOURCE_CANVAS) {
                const { blockIndex, columnIdx, content } = draggedElement.value;
                connect.context.store.dispatch(canvasActions.swapBlockItems({
                    draggedItem: {
                        draggedBlockIndex: blockIndex,
                        draggedColumnIdx: columnIdx,
                        draggedContent: content
                    },
                    droppedItem: {
                        droppedBlockIndex: props.blockIndex,
                        droppedColumnIdx: props.columnIdx,
                        droppedContent: props.content
                    }
                }));
            }
        }
    },
    (connect, monitor) => {
        return {
            connectDropTarget: connect.dropTarget(),
            isOverCurrent: monitor.isOver({ shallow: true }),
            canDrop: monitor.canDrop()
        }
    }
)(connect(mapStateToProps)(BlockItemDropZone));