import { useState, useEffect } from "react"
import {DragDropContext} from 'react-beautiful-dnd'
import { initial, multiDragAwareReorder, multiSelectTo as multiSelect } from '../util';

import { isLegalMove } from "../util";
import Column from "./Column";
import Button from "./Button";
import PlayersUI from "./PlayersUI";
import LastPlayedCards from "./LastPlayedCards";
import RoundEndPage from "./RoundEndPage";
import ExchangeCardsPage from "./ExchangeCardsPage";

const getCards = (entities, columnId) =>
    entities.columns[columnId].cardIds.map(
    (cardId) => entities.cards[cardId]
);

const InGame = ({socket, data, setData, onClickStartGame, showClock, setShowClock, timeLimit, setTimeLimit}) => {
    const [entities, setEntities] = useState(initial);
    const [selectedCardIds, setSelectedCardIds] = useState([]);
    const [draggingCardId, setDraggingCardId] = useState(null);
    const [roundEnd, setRoundEnd] = useState(false);
    const [exchangeCardsState, setExchangeCardsState] = useState(false);

    useEffect(() => {
        if(socket){
            socket.on('nextTurnStart',({message, game, roomId, lastPlayedCards, lastTurnPlayer}) => {
                console.log('next turn start');

                let player = game.players.find((player) => player.uid === data.player.uid);
                if (player.id === lastTurnPlayer.id) {
                    const hand = entities.columns['hand'].cardIds.filter((handCardId) => {
                        return lastPlayedCards.length===0 || lastPlayedCards.some((lastPlayedCard) => handCardId!==lastPlayedCard);
                    });

                    player = {...player, hand};

                } else {
                    const hand = [...entities.columns['hand'].cardIds, ...entities.columns['deck'].cardIds];

                    player = {...player, hand};
                }

                const newData = {
                    ...data,
                    message,
                    game,
                    roomId,
                    player,
                }
                setData(newData);
                sessionStorage.setItem('data', JSON.stringify(newData));

                setShowClock(true);
                setTimeLimit(game.timeLimit);
            });

            socket.on('roundEnd', ({message, game, roomId}) => {
                console.log('game end');

                const player = game.players.find((player) => player.uid === data.player.uid);

                const newData = {
                    ...data,
                    message,
                    game,
                    roomId,
                    player,
                }
                setData(newData);
                sessionStorage.setItem('data', JSON.stringify(newData));

                setShowClock(false);
                setRoundEnd(true);
            });

            socket.on('nextRoundStart',({message, game, roomId}) => {
                console.log({message, game, roomId});
                
                const player = game.players.find((player) => player.uid === data.player.uid);

                const newData = {
                    ...data,
                    message,
                    game,
                    roomId,
                    player,
                }
                setData(newData);
                sessionStorage.setItem('data', JSON.stringify(newData));

                setShowClock(false);
                setExchangeCardsState(true);
            })

            socket.on('exchangeCards', ({message, game, playerExchanged, roomId}) => {
                console.log('exchange card');
                console.log({message, game, playerExchanged, roomId});

                setShowClock(false);
            })

            socket.on('exchangeComplete', ({message, game, roomId}) => {
                console.log('exchange complete');
                console.log({message, game, roomId});

                const player = game.players.find((player) => player.uid === data.player.uid);

                const newData = {
                    ...data,
                    message,
                    game,
                    roomId,
                    player,
                }
                setData(newData);
                sessionStorage.setItem('data', JSON.stringify(newData));
                
                setShowClock(true);
                setTimeLimit(20);

                setExchangeCardsState(false);
                setRoundEnd(false);
            })

            socket.on('startPlaying', ({message, roomId}) => {
                console.log(message);

                const newData = {...data, game: {...data.game, status:'playing'}};

                setData(newData);
                sessionStorage.setItem('data', JSON.stringify(newData));

                setShowClock(true);
                setTimeLimit(data.game.timeLimit);
            })

            socket.on('playerTimesUp', ({message, playerId}) => {
                console.log(message);

                setShowClock(true);
                setTimeLimit(data.game.timeLimit);
            })

            socket.on('backToLobby', ({message, game, roomId}) => {
                console.log(message);

                const player = game.players.find((player) => player.uid === data.player.uid);

                setData({...data, game, player});
            })

        }
        return ()=>{
            if(socket){
                socket.off('nextTurnStart');
                socket.off('roundEnd');
                socket.off('nextRoundStart');
                socket.off('exchangeCards');
                socket.off('exchangeComplete');
                socket.off('startPlaying');
                socket.off('playerTimesUp');
                socket.off('backToLobby');
            }
        }
    }, [socket, entities]);

    useEffect(() => {
        const clockInterval = setInterval(() => {
            setTimeLimit((prevTime) => {
                if (prevTime <= 0) return 0;
                return prevTime - 1;
            });
        }, 1000)

        return () => clearInterval(clockInterval);
    }, []);

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

        console.log(entities);
        
        setEntities({...entities, 
            columns: 
            {"deck": {...entities.columns["deck"], cardIds: []}, 
            "hand": {...entities.columns["hand"], cardIds: [...entities.columns["hand"].cardIds, ...entities.columns["deck"].cardIds]}}
        })

        socket.emit('playerPlayCards',{
            roomId: data.game.roomId,
            player: data.player,
            cards: [],
        }); 
        console.log("pass turn");
    }

    return (
        <>
        {
            showClock &&
            <div className="timer-container">
                <div className="timer">
                    {
                        timeLimit > 0
                        ?   <>
                            <div style={{fontSize:'40px',color:'white'}}>{timeLimit}</div>
                            <div style={{color:'#aaa'}}>seconds</div>
                            </>
                        :  <div style={{fontSize:'20px',color:'white'}}>Time's up!</div>
                    }
                </div>
            </div>
        }
        {
            data.game.status === 'preparing' &&
            <div className="title"><h1>Prepare your cards!</h1></div>
        }
        {
            data.player.isTurn && data.game.status !== 'preparing' &&
            <div className="title"><h1>Your Turn!</h1></div>
        }
        {
            !exchangeCardsState &&
        <>
            <PlayersUI data={data}/>
            <LastPlayedCards data={data}/>
            <DragDropContext
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}>
                <div className="column-container">
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
                </div>
            </DragDropContext>
            {
                data.player.isTurn && data.game.status !== 'preparing' &&
                <Button type="play-card" text="Play" onClick={onClickPlayCard}/>
            }
            {
                data.player.isTurn && data.game.status !== 'preparing' &&
                <Button type="pass" text="Pass" onClick={onClickPassTurn}/>
            }
        </>
        }
        {
            roundEnd && !exchangeCardsState && 
            <RoundEndPage data={data} onClickStartGame={onClickStartGame}/>
        }

        {
            roundEnd && exchangeCardsState &&
            <ExchangeCardsPage data={data} socket={socket}/>
        }
        </>
    )
}

export default InGame
