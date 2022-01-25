import { useState } from "react"
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import axios from "axios";
import config from "../config/config.js";

const root_URL = config.node_env === "development" ? 'http://localhost:5000' : '' 

const MainMenu = ({socket,data,setData}) => {
    const [userName,setUserName] = useState('')
    const [roomId,setRoomId] = useState('')
    const [showRoomId , setShowRoomId] = useState(false);
    const [userNameError, setUserNameError] = useState('');
    const [roomIdError, setRoomIdError] = useState('');

    let navigate = useNavigate();

    function isNum(val){
        return /^\d+$/.test(val)
    }

    //player join the room
    const onClickJoin = async () => {
        if(showRoomId){
            if(roomId && isNum(roomId) && roomId.length===5){
                //join the room
                setRoomIdError('');
                //get room info from server
                //and go to lobby
                try{
                    const res = await axios.post(root_URL + "/api/rooms/join/" + roomId, {name:userName});

                    setRoomIdError('');
                    setData(res.data);
                    localStorage.setItem('data', JSON.stringify(res.data));
                    navigate("../Lobby/"+ roomId);

                    // if(res.get('Room-Availability') === 'available') {
                    //     setRoomIdError('');
                    //     setData(res.data);
                    //     localStorage.setItem('data', JSON.stringify(res.data));
                    //     navigate("../Lobby/"+ roomId);
                    // } else if(res.get('Room-Availability') === 'full') {
                    //     setRoomIdError('this room is currently full!');
                    //     setData(res.data);
                    //     localStorage.setItem('data', JSON.stringify(res.data));
                    // }
                } catch(err){
                    //the room doesn't exist
                    console.log(err);
                    console.log("Room doesn't exist!!");
                    setRoomIdError("Room doesn't exist!");
                }
            }else{
                //no room id
                setRoomIdError('Please Enter a valid room id!');
            }
        } else{
            if(userName){
                //show room id input
                setShowRoomId(true)
                setUserNameError('')
            } else{
                //no username
                setUserNameError('Please Enter a Username!')
            }
        }
    }
    //host create room
    const onClickHost = async () =>{
        console.log('host create room')
        try {
            const res = await axios.post(root_URL + "/api/rooms/hostnew", {name:userName});
            console.log(res);
            setData(res.data);
            localStorage.setItem('data', JSON.stringify(res.data));
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