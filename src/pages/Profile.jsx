import './profile.css';
import { FaPencil } from "react-icons/fa6";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function Profile() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [profileData, setProfileData] = useState({
        nickname: '',
        username: '',
        bio: '',
        qualifications: ''
    });

    useEffect(() => {
        async function fetchProfileData() {
            if (currentUser) {
                try {
                    const userDocRef = doc(db, "users", currentUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setProfileData({
                            nickname: userData.displayName || '',
                            username: userData.username || '',
                            bio: userData.bio || '',
                            qualifications: userData.qualifications || ''
                        });
                    }
                } catch (error) {
                    console.error("Error fetching profile data:", error);
                }
            }
        }
        
        fetchProfileData();
    }, [currentUser]);

    return (
        <div className="container-profile">
            <div className="profile">
                <div className='section'>
                    <h1>Profile</h1>
                    <button className='edit' onClick={() => navigate('/settings')}>
                        <FaPencil />
                    </button>
                </div>
                <button className='profile-pic'>
                    {currentUser?.photoURL ? (
                        <img className='pic' alt="Profile" src={currentUser.photoURL} />
                    ) : (
                        <img className='pic' alt="Default profile" src="/a.png" />
                    )}
                </button>
                <div className='section'>
                    <h2 className='nickname'>{profileData.nickname || "Nickname"}</h2>
                    <h3 className='username'>@{profileData.username || "username"}</h3>
                </div>

                <div className='section'>
                    <div className='about'>
                        <h2 className='head'>About Me:</h2>
                        <h4>{profileData.bio || "No bio available"}</h4>
                    </div>
                </div>

                <div className='section'>
                    <div className='qualifications'>
                        <h2 className='head'>Qualifications:</h2>
                        <h4>{profileData.qualifications || "No qualifications listed"}</h4>
                    </div>
                </div>

                <div className='section'>
                    <div className='connections'>
                        <h2 className='head'>Connections:</h2>
                        <h4>Coming soon...</h4>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;