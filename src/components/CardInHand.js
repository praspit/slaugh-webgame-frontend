const CardInHand = ({socket, cardList, setCardList, draggingItem, dragOverItem}) => {
    const handleDragStart = (e, position) => {
        draggingItem.current = position;
        console.log(e.target.innerHTML);
    };

    const handleDragEnter = (e, position) => {
        dragOverItem.current = position;
        console.log(e.target.innerHTML);
        const listCopy = [...cardList];
        console.log(draggingItem.current, dragOverItem.current);
        const draggingItemContent = listCopy[draggingItem.current];
        listCopy.splice(draggingItem.current, 1);
        listCopy.splice(dragOverItem.current, 0, draggingItemContent);

        draggingItem.current = dragOverItem.current;
        dragOverItem.current = null;
        setCardList(listCopy);
    };

    return (
        <div className="card-in-hand">Cards
                {cardList &&
                    cardList.map((card,index)=>{
                        return (
                            <h1 
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragOver={(e) => e.preventDefault()}
                            key={index} draggable>
                            {card}
                            </h1>
                        )
                    })
                }
        </div>
    )
}

export default CardInHand
