import { useState } from "react"
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import axios from "axios";

const MainMenu = ({socket,data,setData}) => {
    const [userName,setUserName] = useState('')
    const [roomId,setRoomId] = useState('')
    const [showRoomId , setShowRoomId] = useState(false);
    const [userNameError, setUserNameError] = useState('');
    const [roomIdError, setRoomIdError] = useState('');

    let navigate = useNavigate();

    const onClickJoin = async () => {
        if(showRoomId){
            if(roomId){
                //join the room
                setRoomIdError('');
                console.log(`${userName} join ${roomId}`);
                try{
                    const res = await axios.post("http://localhost:5000/api/rooms/join/" + roomId, {name:userName});
                    setRoomIdError('');
                    setData(res.data);
                    navigate("../Lobby/"+ roomId);
                    console.log(res);
                } catch(err){
                    console.log(err);
                    console.log("Room doesn't exist!!");
                    setRoomIdError('Invalid room id!');
                }
            }else{
                setRoomIdError('Please Enter a room id!');
            }
        } else{
            if(userName){
                setShowRoomId(true)
                setUserNameError('')
            } else{
                setUserNameError('Please Enter a Username!')
            }
        }
    }

    const onClickHost = async () =>{
        //socket.emit('hostCreateRoom', { name: userName});
        console.log('host create room')
        try {
            const res = await axios.post("http://localhost:5000/api/rooms/hostnew", {name:userName});
            console.log(res);
            setData(res.data);
            navigate("../Lobby/"+ res.data.game.roomId);
        }catch (err){
            console.log(err);
        }
    }

    const onClickBack = () => {
        setRoomId('');
        setShowRoomId(false);
        setUserNameError('');
        setRoomIdError('');
    }

    return (
        <div className="container">
        <div className='form'>
            <h1 className="logo">Slaught.io</h1>
            <span style={{color:"red"}}>{userNameError}</span>
            {!showRoomId &&
                <input 
                type="text" 
                className="text-input"
                placeholder="Enter your name"
                value={userName}
                onChange={(e)=>setUserName(e.target.value)}
                />
            }
            <span style={{color:"red"}}>{roomIdError}</span>
            {showRoomId &&
                <input 
                type="text" 
                className="text-input"
                placeholder="Enter Room Id"
                value={roomId}
                onChange={(e)=>setRoomId(e.target.value)}
                />
            }

            <Button type='left' text='Join a Room' onClick={onClickJoin}/>
            
            {showRoomId 
                ?   <Button type='right' text='Back' onClick={onClickBack}></Button>
                :   <Button type='right' text='Host new Game' onClick={onClickHost}></Button>
            }
        </div>
        </div>
    )
}

export default MainMenu