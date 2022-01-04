import RoundSlider from './RoundSlider'
import TimeSlider from './TimeSlider'
import Button from './Button'
import { useEffect } from 'react'

const WaitingRoom = ({socket,round,setRound,time,setTime,onClickStartGame,data,setData}) => {

    useEffect((socket,data)=>{
        if(socket){
            socket.emit('playerJoinRoom', { roomId : data.game.roomId, name : data.game.players[0].username });
            console.log(`${data.game.players[0].username} join room ${data.game.roomId}`)
        }
    },[socket])

    useEffect((socket)=>{
        if(socket){
            socket.on('newPlayerJoined', (data)=> {
                console.log(data)
            })
        }
    },[socket])

    // if(socket){
    //     //TODO
    //     socket.emit('playerJoinRoom', { roomId : data.game.roomId, name : data.game.players[0].username })
    //     socket.on('newPlayerJoined', (data)=> {
    //         console.log(data)
    //     })
    // }

    const onRoundChange = (event)=>{
        setRound(event.target.valueAsNumber);
    }

    const onTimeChange = (event)=>{
        setTime(event.target.valueAsNumber);
    }

    return (
        <div className='waiting-room'>
            <div className='list-player'>
                <h2>Room : {data.game.roomId}</h2>
                <ul>
                    {data.game.players.map((player)=>{
                        return <li key={player.id}>{player.username}</li>
                    })}
                </ul>
            </div>
            <div className='game-option'>
                <RoundSlider value={round} onTypeChange={onRoundChange}></RoundSlider>
                <TimeSlider value={time} onTypeChange={onTimeChange}></TimeSlider>
                <Button type='start' text='Start the game' onClick={onClickStartGame}></Button>
            </div>
        </div>
    )
}

export default WaitingRoom
