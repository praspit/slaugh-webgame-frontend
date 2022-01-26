import React from 'react'
import { useState, useEffect} from 'react'
import WaitingRoom from './WaitingRoom'
import io from 'socket.io-client'
import InGame from './InGame'
import config from '../config/config.js'

const root_URL = config.node_env === "development" ? 'http://localhost:5000' : ''

const Lobby = ({data,setData}) => {
    const [socket,setSocket] = useState(null);
    const [inGame,setInGame] = useState(sessionStorage.getItem('inGame')==='true' || false);
    const [time,setTime] = useState(30);

    useEffect(() => {
        //initialize socket
        const newSocket = io(root_URL + '/', { transports : ['websocket'] });
        setSocket(newSocket);

        return () => {
            //close socket
            newSocket.close();
            console.log('close socket');
        }
    }, [setSocket])

    //use socket to recieve event from server
    useEffect(()=>{
        if(!socket)return;

        //catch 'ready' event from server
        socket.on('ready', ({message, mySocketId})=>{
            console.log({message,mySocketId});
            //send roomId and player info to server
            socket.emit('connectRoom', {
                roomId : data.game.roomId,
                player : data.player
            });
            console.log(`${data.player.name} join room ${data.game.roomId}`)
        })

        //get game info from server
        socket.on('connectedToRoom', ({message, roomId, game})=>{
            console.log({message,roomId,game});

            setData({...data, game : game});
            sessionStorage.setItem('data', JSON.stringify({...data, game: game}));
        })

        //get all players from server when new player join
        socket.on('newPlayerJoined',({message,name,roomId,players})=>{
            console.log({message,name,roomId,players});

            setData({...data, game:
                {...data.game, players: players}});
                
            sessionStorage.setItem('data', JSON.stringify({...data, game:
                {...data.game, players: players}}));
        })  

        //start the game 
        socket.on('gameStart', ({message,game,roomId})=>{
            console.log(message);

            const player = game.players.find((player) => player.id === data.player.id);
            
            setData({...data,  player: player, game : game});
            sessionStorage.setItem('data', JSON.stringify({...data,  player: player, game : game}));
            sessionStorage.setItem('inGame', 'true');
            setInGame(true);
        })

        socket.on('playerLeft', ({message, playerName, players, roomId}) => {
            console.log({message, playerName, players, roomId});

            const player = players.find((player) => player.id === data.player.id);

            setData({...data,  player: player, game : {...data.game, players: players}});
            sessionStorage.setItem('data', JSON.stringify({...data,  player: player, game : {...data.game, players: players}}));
        })

        socket.on('playerDisconnected', ({message, game, playerId, roomId}) => {
            console.log(message);

            // alert(message);

            const player = game.players.find((player) => player.id === data.player.id);

            setData({...data,  player: player, game : game});
            sessionStorage.setItem('data', JSON.stringify({...data,  player: player, game : game}));
        })

        socket.on('changeHost', ({message, newHostId, players, roomId}) => {
            console.log({message, newHostId, players, roomId});

            // if(data.player.id === newHostId) {
            //     alert('You are the new host!');
            // }

            const player = players.find((player) => player.id === data.player.id);

            setData({...data,  player: player, game : {...data.game, players: players}});
            sessionStorage.setItem('data', JSON.stringify({...data,  player: player, game : {...data.game, players: players}}));
        })

        return ()=>{
            socket.off('ready');
            socket.off('connectedToRoom');
            socket.off('newPlayerJoined');
            socket.off('gameStart');
            socket.off('playerLeft');
            socket.off('playerDisconnected');
            socket.off('changeHost');
        }

    },[socket,data,setData])

    const onClickStartGame = ()=>{
        if(!socket) return;

        socket.emit('hostStartGame',{
            roomId : data.game.roomId,
            player : data.player,
            timeLimit : time,
        })
        
        setInGame(true);
    }
    
    return (
        <div className='container'>
        {inGame
            ? <InGame socket={socket} data={data} setData={setData} onClickStartGame={onClickStartGame}/>
            : <WaitingRoom socket={socket} time={time} setTime={setTime} data={data} setData={setData} setInGame={setInGame}/>
        }
        </div>
    )
}

export default Lobby
