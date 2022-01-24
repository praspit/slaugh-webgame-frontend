import { Droppable } from "react-beautiful-dnd"
import memoizeOne from 'memoize-one'
import styled from 'styled-components'
import Card from "./Card"
import {grid, colors, borderRadius, cardHeight} from '../constants'

const Container = styled.div`
  margin: ${grid}px;
  ${'' /* border-radius: ${borderRadius}px;
  border: 1px solid ${colors.grey.dark}; */}
  ${'' /* background-color: ${colors.grey.medium}; */}
  /* we want the column to take up its full height */
  display: flex;
  flex-direction: column;
`

const Title = styled.h3`
  font-weight: bold;
  color: ${colors.white};
`

const CardList = styled.div`
  padding: ${grid}px;
  display: flex;
  transition: background-color 0.2s ease;
  overflow: "scroll";
  height: calc(${cardHeight}px + 30px);
  ${'' /* ${props =>
    props.isDraggingOver ? `background-color: ${colors.grey.darker}` : ''}; */}
`


const getSelectedMap = memoizeOne((selectedCardIds) =>
  selectedCardIds.reduce((previous, current) => {
    previous[current] = true;
    console.log(previous);
    return previous
  }, {}),
);

const Column = ({column, cards, selectedCardIds, draggingCardId, toggleSelection, toggleSelectionInGroup, multiSelectTo}) => {
    return (
        <Container>
        <Title>{column.title}</Title>
        <Droppable droppableId={column.id} direction="horizontal">
          {(provided, snapshot) => (
            <CardList
              ref={provided.innerRef}
              isDraggingOver={snapshot.isDraggingOver}
              {...provided.droppableProps}
            >
              {cards.map((card, index) => {
                const isSelected = Boolean(
                  getSelectedMap(selectedCardIds)[card.id]
                );

                const isGhosting =
                  isSelected &&
                  Boolean(draggingCardId) &&
                  draggingCardId !== card.id
                return (
                  <Card
                    card={card}
                    index={index}
                    key={card.id}
                    isSelected={isSelected}
                    isGhosting={isGhosting}
                    selectionCount={selectedCardIds.length}
                    toggleSelection={toggleSelection}
                    toggleSelectionInGroup={toggleSelectionInGroup}
                    multiSelectTo={multiSelectTo}
                  />
                )
              })}
              {provided.placeholder}
            </CardList>
          )}
        </Droppable>
        </Container>
    )
}

export default Column
