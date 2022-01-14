import { Draggable } from "react-beautiful-dnd"
import styled from 'styled-components';
import { grid, colors, borderRadius, cardHeight, cardWidth } from '../constants';

const primaryButton = 0;

const getBackgroundColor = ({
  isSelected,
  isGhosting,
}) => {
  if (isGhosting) {
    return colors.grey.light;
  }

  if (isSelected) {
    return colors.blue.light;
  }

  return colors.grey.light;
}

const getColor = ({ isSelected, isGhosting }) => {
  if (isGhosting) {
    return 'darkgrey';
  }
  if (isSelected) {
    return colors.blue.deep;
  }
  return colors.black;
}

const Container = styled.div`
  padding: ${grid}px;
  border-radius: ${borderRadius}px;
  width: 50px;

  ${props =>
    props.isDragging
      ? ``
      : ''} 
  
  /* needed for SelectionCount */
  position: relative;

  /* avoid default outline which looks lame with the position: absolute; */
  &:focus {
    outline: none;
    border-color: ${colors.blue.deep};
  }
`;

const Content = styled.div``;

const size = 30;

const SelectionCount = styled.div`
  right: -${grid}px;
  top: -${grid}px;
  color: ${colors.white};
  background: ${colors.blue.deep};
  border-radius: 50%;
  height: ${size}px;
  width: ${size}px;
  line-height: ${size}px;
  position: absolute;
  text-align: center;
  font-size: 0.8rem;
`;

const keyCodes = {
  enter: 13,
  escape: 27,
  arrowDown: 40,
  arrowUp: 38,
  tab: 9,
};

const Card = ({card, index, isSelected, selectionCount, isGhosting,toggleSelection, toggleSelectionInGroup, multiSelectTo}) => {
    const onKeyDown = (event,provided,snapshot) => {
    if (event.defaultPrevented) {
      return;
    }

    if (snapshot.isDragging) {
      return;
    }

    if (event.keyCode !== keyCodes.enter) {
      return;
    }

    // we are using the event for selection
    event.preventDefault();

    const wasMetaKeyUsed = event.metaKey;
    const wasShiftKeyUsed = event.shiftKey;

    performAction(wasMetaKeyUsed, wasShiftKeyUsed);
  };

  // Using onClick as it will be correctly
  // preventing if there was a drag
  const onClick = (event) => {
    if (event.defaultPrevented) {
      return;
    }

    if (event.button !== primaryButton) {
      return;
    }

    // marking the event as used
    event.preventDefault();

    const wasMetaKeyUsed = event.metaKey;
    const wasShiftKeyUsed = event.shiftKey;

    performAction(wasMetaKeyUsed, wasShiftKeyUsed);
  };

  const onTouchEnd = (event) => {
    if (event.defaultPrevented) {
      return;
    }

    // marking the event as used
    // we would also need to add some extra logic to prevent the click
    // if this element was an anchor
    event.preventDefault();
    toggleSelectionInGroup(card.id);
  };

  const performAction = (wasMetaKeyUsed, wasShiftKeyUsed) => {
    if (wasMetaKeyUsed) {
      toggleSelectionInGroup(card.id);
      return;
    }

    if (wasShiftKeyUsed) {
      multiSelectTo(card.id);
      return;
    }

    toggleSelection(card.id);
  };


    return(
      <Draggable draggableId={card.id} index={index}>
        {(provided, snapshot) => {
          const shouldShowSelection =
            snapshot.isDragging && selectionCount > 1;

          return (
            <Container
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              onClick={onClick}
              onTouchEnd={onTouchEnd}
              onKeyDown={(event) =>
                onKeyDown(event, provided, snapshot)
              }
              isDragging={snapshot.isDragging}
              isSelected={isSelected}
              isGhosting={isGhosting}
            >
              <Content><img alt={`${card.content}`} style={{height: `${cardHeight}px`, width:`${cardWidth}px`}} src={require(`../images/cards/${card.content}.png`)}/></Content>
              {shouldShowSelection ? (
                <SelectionCount>{selectionCount}</SelectionCount>
              ) : null}
            </Container>
          );
        }}
      </Draggable>
    )
}

export default Card
