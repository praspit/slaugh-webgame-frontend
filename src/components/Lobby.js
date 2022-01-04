import React from 'react'
import { useState, useEffect} from 'react'
import WaitingRoom from './WaitingRoom'
import io from 'socket.io-client'

const Lobby = ({data,setData}) => {
    const [socket,setSocket] = useState(null);
    const [inGame,setInGame] = useState(false);
    const [round,setRound] = useState(1);
    const [time,setTime] = useState(15);

    useEffect(() => {
        const newSocket = io('http://localhost:5000/', { transports : ['websocket'] });
        setSocket(newSocket);
        console.log('new socket')

        return () => {
        newSocket.close();
        console.log('close socket');
        }
    }, [setSocket])

    const onClickStartGame = ()=>{
        console.log(`start game for ${round} rounds and time per turn is ${time} seconds`)
        setInGame(true);
    }
    
    return (
        <div className='container'>
        {inGame
            ? <h1 style={{color:"white"}}>In Game</h1>
            : <WaitingRoom socket={socket} round={round} setRound={setRound} time={time} setTime={setTime} onClickStartGame={onClickStartGame} data={data} setData={setData} />
        }
        </div>
    )
}

export default Lobby
