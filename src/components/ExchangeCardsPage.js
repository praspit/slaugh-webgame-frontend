import { useState, useEffect} from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { initialExchangeCard, multiDragAwareReorder, multiSelectTo as multiSelect } from "../util";
import styled from "styled-components";

import Column from "./Column";
import Button from "./Button";

const getCards = (entities, columnId) =>
    entities.columns[columnId].cardIds.map(
    (cardId) => entities.cards[cardId]
);

const Container = styled.div`
  display: flex;
  user-select: none;
  padding: 10px;
  flex-direction: column;
  position: absolute;
  bottom: 0px;
  margin-left: auto;
  margin-right: auto;
  left: 0px;
  right: 0px;
  text-align: center;
  width: min(70vw,700px);
`;

const ExchangeCardsPage = ({data, socket}) => {
    const [exchangeCardsEntities, setExchangeCardsEntities] = useState(initialExchangeCard);
    const [selectedCardIds, setSelectedCardIds] = useState([]);
    const [draggingCardId, setDraggingCardId] = useState(null);



    useEffect(() => {
        const cards = data.player.hand.map((val)=>{
            return (
                {id: `${val}`,
                content: `${val}`});
        });

        const cardMap = cards.reduce((previous,current)=>{
            previous[current.id] = current
            return previous
        },
        {})

        const keepCard = {
            id:'keepCard',
            title: 'Card In Hand',
            cardIds: cards.map(card => card.id)
        }

        const sendCard = {
            id:'sendCard',
            title: 'Place the card that you want to exchange',
            cardIds: []
        }

        const entities = {
            columnOrder: [sendCard.id, keepCard.id],
            columns: {
                [sendCard.id]: sendCard,
                [keepCard.id]: keepCard
            },
            cards: cardMap
        }

        setExchangeCardsEntities(entities);
    },[data])

    useEffect(() => {
        window.addEventListener('click', onWindowClick);
        window.addEventListener('keydown', onWindowKeyDown);
        window.addEventListener('touchend', onWindowTouchEnd);
        return (()=>{
            window.removeEventListener('click', onWindowClick);
            window.removeEventListener('keydown', onWindowKeyDown);
            window.removeEventListener('touchend', onWindowTouchEnd);
        })
    })

    const onDragStart = (start) => {
        const id = start.draggableId;
        const selected = ()=>{
            selectedCardIds.find((cardId)=> cardId === id);
        }

        if(!selectedCardIds.some(selected)) {
            unselectAll();
        }
        setDraggingCardId(start.draggableId);
    }

    const onDragEnd = (result) => {
        const destination = result.destination;
        const source = result.source;

        //nothing to do
        if(!destination || result.reason ==='CANCEL'){
            setDraggingCardId(null);
            return;
        }

        const processed = multiDragAwareReorder({
            entities: exchangeCardsEntities,
            selectedCardIds: selectedCardIds,
            source,
            destination,
        })

        setExchangeCardsEntities(processed.entities);
        setSelectedCardIds(processed.selectedCardIds);
        setDraggingCardId(null);        
    }

    const onWindowKeyDown = (event) => {
        if (event.defaultPrevented) {
        return;
        }

        if (event.key === 'Escape') {
            unselectAll();
        }
    };

    const onWindowClick = (event) => {
        if (event.defaultPrevented) {
            return;
        }
        unselectAll();
    };

    const onWindowTouchEnd = (event) => {
        if (event.defaultPrevented) {
            return;
        }
        unselectAll();
    };

    const toggleSelection = (cardId) => {
        const wasSelected = selectedCardIds.includes(cardId);

        const newCardIds = (()=>{
            // Card was not previously selected
            // now will be the only selected item
            if (!wasSelected) {
                return [cardId];
            }

            // Card was part of a selected group
            // will now become the only selected item
            if (selectedCardIds.length > 1) {
                return [cardId];
            }

            // card was previously selected but not in a group
            // we will now clear the selection
            return [];
        })();

        setSelectedCardIds(newCardIds);
    }

    const toggleSelectionInGroup = (cardId) => {
        const index = selectedCardIds.indexOf(cardId);

        //if it's not previously selected, add it to the group
        if (index === -1) {
            setSelectedCardIds([...selectedCardIds, cardId]);
            return;
        }

        //if it's previously selected, remove it from the group
        const shallow = [...selectedCardIds];
        shallow.splice(index, 1);
        setSelectedCardIds(shallow);
    }

    const multiSelectTo = (newCardId) => {
        const updated = multiSelect(
            exchangeCardsEntities,
            selectedCardIds,
            newCardId,
        );
        
        if(updated == null){
            return;
        }

        setSelectedCardIds(updated);
    }

    const unselectAll = () => {
        setSelectedCardIds([]);
    }

    const onClickExchangeCards = () => {
        if(!isKing() && !isQueen())return;

        if(isKing() && exchangeCardsEntities.columns['sendCard'].cardIds.length !== 2){
            alert("you can exchange 2 cards");
            return;
        }

        if(isQueen() && exchangeCardsEntities.columns['sendCard'].cardIds.length !== 1){
            alert("you can exchange 1 card");
            return;
        }

        console.log({data, exchangeCardsEntities});

        socket.emit('offerCards', {
            roomId: data.game.roomId,
            player: data.player,
            cards: exchangeCardsEntities.columns['sendCard'].cardIds,
        })
    }

    const isKing = () => {
        const id = data.player.id;
        return id === data.game.king;
    }

    const isQueen = () => {
        const id = data.player.id;
        return id === data.game.queen;
    }

    return (
        <>
            <div className="glass-pane">
                <h2>Exchange Cards Phase!</h2>
                <DragDropContext
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}>
                    <Container>
                        {exchangeCardsEntities.columnOrder.map((columnId) => (
                            <Column
                                column={exchangeCardsEntities.columns[columnId]}
                                cards={getCards(exchangeCardsEntities, columnId)}
                                selectedCardIds={selectedCardIds}
                                key={columnId}
                                draggingCardId={draggingCardId}
                                toggleSelection={toggleSelection}
                                toggleSelectionInGroup={toggleSelectionInGroup}
                                multiSelectTo={multiSelectTo}
                            />
                        ))}
                    </Container>
                </DragDropContext>
                {
                (isKing() || isQueen()) && 
                <Button type="play-card" text="Exchange" onClick={onClickExchangeCards}/>
                }
            </div>
        </>
    )
};

export default ExchangeCardsPage;