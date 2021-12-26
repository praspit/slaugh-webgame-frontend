import { useState } from "react"
import Button from "./Button";

const MainMenu = () => {
    const [userName,setUserName] = useState('')
    const [roomId,setRoomId] = useState('')
    const [showRoomId , setShowRoomId] = useState(false);
    const [userNameError, setUserNameError] = useState('');
    const [roomIdError, setRoomIdError] = useState('');


    const onClickJoin = () => {
        if(showRoomId){
            if(roomId){
                //join the room
                setRoomIdError('')
                console.log(`${userName} join ${roomId}`)
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
                //console.log('please enter a username')
            }
        }
    }

    const onClickHost = () =>{
        console.log(userName + 'host new room!')
    }

    const onClickBack = () => {
        setRoomId('');
        setShowRoomId(false);
        setUserNameError('');
        setRoomIdError('');
    }

    return (
        <>
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
        </>
    )
}

export default MainMenu