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
        //initialize socket
        const newSocket = io('http://localhost:5000/', { transports : ['websocket'] });
        setSocket(newSocket);

        return () => {
            //close socket
            newSocket.close();
            console.log('close socket');
        }
    }, [setSocket])

    useEffect(()=>{
        if(!socket)return;

        socket.on('ready', ({message, mySocketId})=>{
            console.log({message,mySocketId});
            socket.emit('connectRoom', {
                roomId : data.game.roomId,
                player : data.player
            });
            console.log(`${data.player.name} join room ${data.game.roomId}`)
        })

        socket.on('connectedToRoom', ({message, roomId, game})=>{
            console.log({message,roomId,game});
            setData({...data, game : game});
        })

        socket.on('newPlayerJoined',({message,name,roomId,players})=>{
            console.log({message,name,roomId,players});
            setData({...data, game:
                {...data.game, players: players}});
        })  

        socket.on('gameStart', ({message,game,roomId})=>{
            console.log(message)
            setData({...data, game : game});
            setInGame(true);
        })

        return ()=>{
            socket.off('ready');
            socket.off('connectedToRoom');
            socket.off('newPlayerJoined');
            socket.off('gameStart');
        }

    },[socket,data,setData])

    const onClickStartGame = ()=>{
        // console.log(socket);
        // console.log(data);
        if(!socket) return;

        socket.emit('hostStartGame',{
            roomId : data.game.roomId,
            player : data.player
        })

        console.log(`start game for ${round} rounds and time per turn is ${time} seconds`)
        
        setInGame(true);
    }
    
    return (
        <div className='container'>
        {inGame
            ? <h1 style={{color:"white"}}>In Game</h1>
            : <WaitingRoom  round={round} setRound={setRound} time={time} setTime={setTime} onClickStartGame={onClickStartGame} data={data} />
        }
        </div>
    )
}

export default Lobby
