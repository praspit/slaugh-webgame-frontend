import { useState, useEffect, useRef } from "react"
import CardInHand from "./CardInHand";

const InGame = ({socket}) => {
    const [cardList,setCardList] = useState(['3C', '3D', '3H', '3S', '4C']);

    const draggingItem = useRef();
    const dragOverItem = useRef();

    useEffect(() => {
        if(socket){
            console.log('have socket in game');
            socket.on('nextTurnStart',({message})=>{
                console.log(message);
            });
        }
        return ()=>{
            socket.off('nextTurnStart');
        }
    }, [socket])

    const handleCardDrop = (e)=>{
        const listCopy = [...cardList];
        const draggingItemContent = listCopy[draggingItem.current];
        listCopy.splice(draggingItem.current, 1);

        console.log(`place ${draggingItemContent} card!!`)

        draggingItem.current = null;
        dragOverItem.current = null;
        setCardList(listCopy);

    }

    return (
        <>
            <h1 style={{color:'white'}}>In Game</h1>
            <div className="card-deck" onDragEnd={handleCardDrop} >
                <h1>Deck of Cards</h1>
            </div>
            <CardInHand socket={socket} cardList={cardList} setCardList={setCardList} draggingItem={draggingItem} dragOverItem={dragOverItem}/>
        </>
    )
}

export default InGame
