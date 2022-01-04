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
                //<Link to={"../Lobby"}/>
                navigate("../Lobby/"+ roomId);
                try{
                    const res = await axios.get("http://localhost:5000/room/" + roomId );
                    console.log(res);
                } catch(err){
                    console.log(err);
                }
                //socket.emit('playerJoinRoom', { roomId : roomId.toString(), name : userName });
            }else{
                // console.log('please enter roomId!!')
                setRoomIdError('Please Enter a room id!')
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
            const res = await axios.get("http://localhost:5000/hostnew");
            console.log(res);
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

    // if(socket){
    //     socket.on('roomCreated', (data)=> {
    //         console.log(`room ${data.roomId} created`)
    //         console.log(data)
    //         setData(data);
    //     })

    //     socket.on('joinRoomSuccess', (data)=> {
    //         // server emit this if find room and room exist
    //         // location.href = `http://localhost:5000/enter-name/${data.roomId}`
    //         console.log(data)
    //         setData(data);
    //     })

    //     socket.on('newPlayerJoined', (data)=> {
    //         console.log(data)
    //         setData(data);
    //     })

    //     socket.on('roomNotExistError', (data)=> {
    //         console.log(data.message)
    //         setData(data);
    //     })
    // }

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