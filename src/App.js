import MainMenu from './components/MainMenu';
import Lobby from './components/Lobby';
import { useState, useEffect } from 'react';
import io from 'socket.io-client'

function App() {
  const [socket,setSocket] = useState(null);

  //gameState
  //0 = Mainmenu
  //1 = Lobby
  //2 = In game
  const [gameState,setGameState] = useState(0);

  useEffect(() => {
    const newSocket = io('http://localhost:5000/', { transports : ['websocket'] });
    setSocket(newSocket);
    console.log('new socket')
    return () => {
      newSocket.close();
      console.log('close socket');
    }
  }, [setSocket])

  return (
    <div className='container'>
      {gameState===0 &&
        <MainMenu socket={socket} setGameState={setGameState}/>
      }
      {gameState===1 &&
        <Lobby socket={socket} setGameState={setGameState}/>
      }
    </div>
  );
}

export default App;