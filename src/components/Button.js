import React from 'react'

const Button = ({type,text,onClick}) => {


    return (
        <div className="btn-layout">
            <button 
            className={`btn btn-${type}`} 
            onClick={()=>onClick()}>{text}</button>
        </div>
    )
}

export default Button
