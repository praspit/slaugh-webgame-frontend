import { useState, useEffect } from "react";

const PlayerUI = ({player, data}) => {
    const [detail, setDetail] = useState("waiting");

    useEffect(() => {
        if(player.connection === 'disconnected') {
            setDetail('disconnected . .');
            return;
        }

        if(player.handSize===0) {
            setDetail("waiting for next round...");
            return;
        }

        if(player.passing){
            setDetail("passed");
            return;
        }

        if(player.isTurn){
            setDetail("playing...");
            return;
        }

        if(data.game.nextTurn === player.id){
            setDetail("play next turn");
            return;
        }

        if(data.game.table.prev === player.id){
            setDetail("play last turn");
            return;
        } 

        setDetail("waiting");
    }, [player, data])

    return (
        <div className="player-ui">
            <div className="avatar">
                {player.status }
            </div>
            <div className="player-info">
                <div className="player-heading">
                    <div className="player-name">{player.name}</div>
                    <div className="player-card-number">{player.handSize}</div>
                </div>
                <div className="player-detail">
                    {detail}
                </div>
            </div>
        </div>
    )
}

export default PlayerUI
