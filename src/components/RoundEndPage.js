import { useEffect, useState } from "react";
import Button from "./Button";

const RoundEndPage = ({data, onClickStartGame, socket}) => {
    const [text, setText] = useState('');

    useEffect(() => {
        const id = data.player.id;
        if(data.game.king === id ) {
            setText('You are the King!!')
            return;
        }

        if(data.game.queen === id ) {
            setText('You are the Queen!!')
            return;
        }

        if(data.game.highSlave === id ) {
            setText('You are the High Slave!!')
            return;
        }
        if(data.game.slave === id ) {
            setText('You are the Slave!!')
            return;
        }

        setText('You are normal people!!');

    }, [data])

    const onClickBack = () => {
        if(!socket) return;

        console.log('host go back to lobby');
        socket.emit('hostGoBackToLobby', {
            message: 'host go back to lobby',
            roomId: data.roomId,
        })
    }

        
    return (
        <>
        <div className="glass-pane">
            <h2>End of the Round!</h2>
            <h3>{text}</h3>
            {
                data.player.isHost 
                ? 
                <div className= 'btn-layout-next-round'>
                    <Button type='left' text='Start next round' onClick={onClickStartGame}></Button>
                    <Button type='right' text='Back' onClick={onClickBack}></Button>
                </div>
                : <h4>waiting for host to start next round . .</h4>
            }
        </div>

        </>
    )
};

export default RoundEndPage;
