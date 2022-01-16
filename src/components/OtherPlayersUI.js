import { useState, useEffect } from "react";
import PlayerUI from "./PlayerUI";

const OtherPlayersUI = ({data}) => {
    const [otherPlayers, setOtherPlayers] = useState(null);

    useEffect(() => {
        setOtherPlayers(data.game.players.filter(player => player.id !== data.player.id));
    }, [data])

    return (
        <div className="other-player-in-game">
            {otherPlayers.map((player) => {
                <PlayerUI player={player}/>
            })
            }
        </div>
    )
}

export default OtherPlayersUI
