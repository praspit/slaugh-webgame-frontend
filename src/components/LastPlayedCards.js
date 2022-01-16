import styled from "styled-components"

import { grid, borderRadius, cardHeight, cardWidth } from "../constants"

const Container = styled.div`
padding: ${grid}px;
border-radius: ${borderRadius}px;
width: 50px;
`

const LastPlayedCards = ({lastPlayedCards}) => {
    return (
        <div className="last-played-cards">
            {lastPlayedCards &&
                lastPlayedCards.map((card) => {
                    <Container>
                        <img alt={`${card}`} style={{height: `${cardHeight}px`, width:`${cardWidth}px`}} src={require(`../images/cards/${card}.png`)}/>
                    </Container>
                })
            }
        </div>
    )
}

export default LastPlayedCards