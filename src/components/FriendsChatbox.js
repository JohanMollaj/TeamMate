import React from 'react';
import './friendsChatbox.css';
import { useNavigate } from 'react-router-dom';

function FriendsChatbox(){
    return (
        <>
        <div className='chatboxContainer'>
            <div className='chatboxHeader'>
                <h1 className='userHeader'>Username</h1>
            </div>
            <div className='chatboxMain'>
                example
            </div>
        </div>
        </>
    );
}

export default FriendsChatbox;