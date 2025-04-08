import './profile.css';
import { FaPencil } from "react-icons/fa6";
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Profile(){
    const navigate  = useNavigate();

    return(
        <div className="container-profile">
                {/* Dashboard */}
                <div className="profile">
                    <div className='section'>
                        <h1>Profile</h1>
                        <button className='edit' onClick={() => navigate('/settings')}>
                            <FaPencil />
                        </button>
                    </div>
                    <button className='profile-pic'>
                        <img className='pic' alt="" src = "/a.png"/>
                    </button>
                    <div className='section'>
                        <h2 className='nickname'>Nickname</h2>
                        <h3 className='username'>Username</h3>
                    </div>

                    <div className='section'>
                        <div className='about'>
                            <h2 className='head'>About Me:</h2>
                            <h4>random bullshit go</h4>
                        </div>
                    </div>

                    <div className='section'>
                        <div className='qualifications'>
                            <h2 className='head'>Qualifications:</h2>
                            <h4>random bullshit go</h4>
                        </div>
                    </div>

                    <div className='section'>
                        <div className='connections'>
                            <h2 className='head'>Connections:</h2>
                            <h4>random bullshit go</h4>
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default Profile;