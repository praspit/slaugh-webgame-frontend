import TimeSlider from './TimeSlider'
import Button from './Button'

const WaitingRoom = ({time,setTime,onClickStartGame,data,setData}) => {
    const onTimeChange = (event)=>{
        setTime(event.target.valueAsNumber);
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
