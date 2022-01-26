import TimeSlider from './TimeSlider'
import Button from './Button'
import { useState } from 'react'

const WaitingRoom = ({socket, time, setTime, data, setData, setInGame}) => {
    const [error, setError] = useState('');

    const onTimeChange = (event)=>{
        setTime(event.target.valueAsNumber);
    }

    const onClickStartGame = ()=>{
        if(!socket) return;
        if(data.game.players.length < 4 ){
            setError('Need 4 players to start the game!');
            return;
        }

        socket.emit('hostStartGame',{
            roomId : data.game.roomId,
            player : data.player,
            timeLimit : time,
        })
        
        setError('');
        setInGame(true);
    }

    return (
        <div className='waiting-room'>
            <div className='list-player'>
                <h2>Room : {data.game.roomId}</h2>
                <ul>
                    {data.game.players.map((player)=>{
                        return <li key={player.id}>{player.name}</li>
                    })}
                </ul>
            </div>
            {data.player.isHost 
                ?
                    <div className='game-option'>
                        <TimeSlider value={time} onTypeChange={onTimeChange}></TimeSlider>
                        <span>{error}</span>
                        <Button type='start' text='Start the game' onClick={onClickStartGame}></Button>
                    </div>
                :
                    <div className='game-option'>
                        <h2>Waiting for host to start the game...</h2>
                    </div>
            }
        </div>
    )
}

export default WaitingRoom
