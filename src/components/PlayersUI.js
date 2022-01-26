import { useState, useEffect } from "react";
import PlayerUI from "./PlayerUI";

const PlayersUI = ({data}) => {
    const [players, setPlayers] = useState(null);

    useEffect(() => {
        setPlayers(data.game.players);
    }, [data])

    return (
        <div className="players-in-game">
            {players && players.map((player) => {
                return <PlayerUI key={player.uid} player={player} data={data}/>;
            })
            }
        </div>
    )
}

export default PlayersUI
