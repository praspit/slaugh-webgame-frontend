import { useState, useEffect } from "react"
import styled from "styled-components";
import {DragDropContext} from 'react-beautiful-dnd'
import { multiDragAwareReorder, multiSelectTo as multiSelect } from '../util';

import { isLegalMove } from "../util";
import Column from "./Column";
import Button from "./Button";
import OtherPlayersUI from "./OtherPlayersUI";
import LastPlayedCards from "./LastPlayedCards";

const hand = {
    id:'hand',
    title: 'Card In Hand',
    cardIds: []
}

const deck = {
    id:'deck',
    title: 'Place the card here',
    cardIds: []
}

const initial = {
    columnOrder: [deck.id, hand.id],
    columns: {
        [deck.id]: deck,
        [hand.id]: hand
    },
    cards: []
}

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


const InGame = ({socket, data, setData}) => {
    const [entities, setEntities] = useState(initial);
    const [selectedCardIds, setSelectedCardIds] = useState([]);
    const [draggingCardId, setDraggingCardId] = useState(null);

    useEffect(() => {
        if(socket){
            console.log('have socket in game');
            socket.on('nextTurnStart',({message, game, roomId, lastPlayedCards, lastTurnPlayer}) => {
                console.log('next turn start');
                console.log(message,game,roomId,lastPlayedCards,lastTurnPlayer);

                const player = game.players.find((player) => player.id === data.player.id);

                const newData = {
                    ...data,
                    message,
                    game,
                    roomId,
                    player,
                }
                setData(newData);
                
                sessionStorage.setItem('data', JSON.stringify(newData));
            });

            socket.on('roundEnd', ({message, game, roomId}) => {
                console.log('game end');

                const player = game.players.find((player) => player.id === data.player.id);

                const newData = {
                    ...data,
                    message,
                    game,
                    roomId,
                    player,
                }
                setData(newData);
                sessionStorage.setItem('data', JSON.stringify(newData));
            });

            socket.on('nextRoundStart',({message, game, roomId}) => {
                console.log({message, game, roomId});
                
                const player = game.players.find((player) => player.id === data.player.id);

                const newData = {
                    ...data,
                    message,
                    game,
                    roomId,
                    player,
                }
                setData(newData);
                sessionStorage.setItem('data', JSON.stringify(newData));
            })
        }
        return ()=>{
            if(socket){
                console.log('socket off');
                socket.off('nextTurnStart');
                socket.off('roundEnd');
                socket.off('nextRoundStart');
            }
        }
    }, [socket])

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

        const hand = {
            id:'hand',
            title: 'Card In Hand',
            cardIds: cards.map(card => card.id)
        }

        const deck = {
            id:'deck',
            title: 'Place the card here',
            cardIds: []
        }

        const entities = {
            columnOrder: [deck.id, hand.id],
            columns: {
                [deck.id]: deck,
                [hand.id]: hand
            },
            cards: cardMap
        }

        setEntities(entities);
    },[data])

    const onDragStart = (start) =>{
        const id = start.draggableId;
        const selected = ()=>{
            selectedCardIds.find((cardId)=> cardId === id);
        }

        if(!selectedCardIds.some(selected)) {
            unselectAll();
        }
        setDraggingCardId(start.draggableId);
    }

    const onDragEnd = (result) =>{
        const destination = result.destination;
        const source = result.source;

        //nothing to do
        if(!destination || result.reason ==='CANCEL'){
            setDraggingCardId(null);
            return;
        }

        const processed = multiDragAwareReorder({
            entities: entities,
            selectedCardIds: selectedCardIds,
            source,
            destination,
        })

        setEntities(processed.entities);
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

    const toggleSelection = (cardId)=>{
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

    const multiSelectTo = (newCardId)=>{
        const updated = multiSelect(
            entities,
            selectedCardIds,
            newCardId,
        );
        
        if(updated == null){
            return;
        }

        setSelectedCardIds(updated);
    }

    const unselectAll = ()=>{
        setSelectedCardIds([]);
    }

    const onClickPlayCard = () => {
        if(!data.player.isTurn)return;

        if(!isLegalMove(entities.columns['deck'].cardIds, data.game.table)){
            alert("The move is illegal!");
            return;
        }
        //emit player play card
        socket.emit('playerPlayCards',{
            roomId: data.game.roomId,
            player: data.player,
            cards: entities.columns['deck'].cardIds,
        });

        console.log(entities.columns['deck'].cardIds);
    }

    const onClickPassTurn = () => {
        if(!data.player.isTurn)return;

        socket.emit('playerPlayCards',{
            roomId: data.game.roomId,
            player: data.player,
            cards: [],
        });        

        setEntities({...entities, 
            columns: 
            {"deck": {...entities.columns["deck"], cardIds: []}, 
            "hand": {...entities.columns["hand"], cardIds: [...entities.columns["hand"].cardIds, ...entities.columns["deck"].cardIds]}}
        })
        console.log("pass turn");
    }

    return (
        <>
        {/* <OtherPlayersUI data={data}/> */}
        <LastPlayedCards data={data}/>
        <DragDropContext
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}>
            <Container>
                {entities.columnOrder.map((columnId) => (
                    <Column
                        column={entities.columns[columnId]}
                        cards={getCards(entities, columnId)}
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
            data.player.isTurn && 
            <Button type="play-card" text="Play" onClick={onClickPlayCard}/>
        }
        {
            data.player.isTurn &&
            <Button type="pass" text="Pass" onClick={onClickPassTurn}/>
        }
        </>
    )
}

export default InGame