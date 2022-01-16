import styled from "styled-components"

import { grid, borderRadius, cardHeight, cardWidth } from "../constants"

const Container = styled.div`
padding: ${grid}px;
border-radius: ${borderRadius}px;
width: 50px;
`

const LastPlayedCards = ({data}) => {
    const lastPlayedCards = data.game.table.top;

    return (
        <div className="last-played-cards">
            {(lastPlayedCards.length) 
            ?   lastPlayedCards.map((card) => {
                    return(
                    <Container key={card}>
                        <img alt={card} style={{height: `${cardHeight}px`, width:`${cardWidth}px`}} src={require(`../images/cards/${card}.png`)}/>
                    </Container>)
                })
            :   <Container>
                    <img alt={"card-back"} style={{height: `${cardHeight}px`, width:`${cardWidth}px`}} src={require(`../images/cardBack.png`)}/>
                </Container>
            }
        </div>
    )
}

export default LastPlayedCards