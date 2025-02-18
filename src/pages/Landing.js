import React from "react";
import { useNavigate } from 'react-router-dom';
import './landing.css';

import Aurora from '../components/Backgrounds/Aurora/Aurora';
import StarBorder from '../components/StarBorder/StarBorder';
import ShinyText from '../components/TextAnimations/ShinyText/ShinyText';

export default function(){
    const navigate  = useNavigate();

    return(
        <div>
            <div className="container-landingpage">
                <div className="landingPageTop">
                    <div className="TopLeft">
                        <h1>TeamMate</h1>
                    </div>
                    <div className="TopCenter">
                        <a href="/" className="TopLinks">About Us</a>
                        <a href="/" className="TopLinks">FAQ</a>
                        <a href="/" className="TopLinks">Support</a>
                    </div>
                    <div className="TopRight">
                    <StarBorder
                        as="button"
                        className="custom-class"
                        color="white"
                        speed="5s"
                        >
                        Log In
                        </StarBorder>
                    </div>
                </div>
                
            <div className="LandingPageBody">
                <div className="LandingSection 1st">
                    <h1 className="text-5xl font-bold text-emerald-400 mb-4">Welcome To TeamMate</h1>
                    <p className="text-xl text-gray-300 mb-8 text-center">Your all-in-one platform for seamless teaching and learning experiences. Connect, collaborate, and educate like never before.</p>
                    <button onClick={() => navigate('/dashboard')} className="text-xl px-5 py-4 border-2 border-white/100 rounded rounded-xl transition-colors duration-200 ease-in-out hover:border-emerald-300 hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50">
                        <ShinyText text="Get Started" disabled={false} speed={3} className='custom-class' />
                    </button>
                </div>
                <div className="LandingSection 2nd">
                    <h1 className="text-4xl font-bold text-emerald-400 mb-4">Engage with Group Calls</h1>
                    <p className="text-xl text-gray-300 mb-8 text-center">
                        Experience dynamic virtual classrooms with our powerful group call feature. Whether it’s a lecture, discussion, or study session, bring everyone together effortlessly.
                        <ol>
                            <li>Crystal Clear Audio & Video: Foster real-time interactions with high-quality audio and video calls.</li>
                            <li>Screen Sharing & Presentation Mode: Make lessons more interactive with easy screen sharing and presentation tools.</li>
                            <li>Integrated Whiteboard: Illustrate complex ideas with ease using a built-in whiteboard during calls.</li>
                        </ol>
                    </p>
                </div>
                <div className="LandingSection 3rd">
                    <h1 className="text-4xl font-bold text-emerald-400 mb-4">Simplify Work Assignments</h1>
                    <p className="text-xl text-gray-300 mb-8 text-center">
                    Streamline your workflow with our efficient assignment management system.
                        <ol>
                            <li>Create & Distribute Tasks: Assign work to individuals or groups in just a few clicks.</li>
                            <li>Submission Tracking: Keep track of submissions and deadlines effortlessly.</li>
                            <li>Feedback & Grading: Provide constructive feedback and grades directly within the platform.</li>
                        </ol>
                    </p>
                </div>
                <div className="LandingSection 4th">
                    <h1 className="text-4xl font-bold text-emerald-400 mb-4">Collaborate with an Integrated Whiteboard</h1>
                    <p className="text-xl text-gray-300 mb-8 text-center">
                    Make complex concepts easier to understand with our integrated whiteboard during calls.
                        <ol>
                            <li>Real-Time Collaboration: Write, draw, and brainstorm together in real-time.</li>
                            <li>Versatile Tools: Use a variety of tools like pens, markers, shapes, and text to illustrate ideas clearly.</li>
                            <li>Save & Share: Save whiteboard sessions for future reference or share them with students after class.</li>
                        </ol>
                    </p>
                </div>
                <div className="LandingSection 5th">
                    <h1 className="text-4xl font-bold text-emerald-400 mb-4">Connect with Ease</h1>
                    <p className="text-xl text-gray-300 mb-8 text-center">
                    Building connections has never been this easy.
                        <ol>
                            <li>Direct Messaging & Group Chats: Stay connected with students and colleagues through direct messages or group chats.</li>
                            <li>Smart Notifications: Get notified of important updates like new assignments or upcoming group calls.</li>
                            <li>Cross-Platform Access: Available on web and mobile, ensuring you stay connected wherever you are.</li>
                        </ol>
                    </p>
                </div>
                <div className="LandingSection 6th">
                    <h1 className="text-4xl font-bold text-emerald-400 mb-4">Why Choose TeamMate</h1>
                    <p className="text-xl text-gray-300 mb-8 text-center">
                    Transform the way you teach and learn with a platform designed specifically for online education.
                        <ol>
                            <li>All-in-One Solution: No need for multiple tools. Get everything in one place.</li>
                            <li>User-Friendly Interface: Intuitive design that’s easy for both teachers and students to navigate.</li>
                            <li>Secure & Reliable: Prioritizing your privacy and data security with top-notch encryption.</li>
                        </ol>
                    </p>
                </div>
                <div className="LandingSection 7th">
                    <h1 className="text-4xl font-bold text-emerald-400 mb-4">Get Started Today!</h1>
                    <p className="text-xl text-gray-300 mb-8 text-center">
                        Join the future of education with TeamMate. Sign up now and start teaching smarter, not harder!
                    </p>
                    <button onClick={() => navigate('/dashboard')} className="text-xl px-5 py-4 border-2 border-white/100 rounded rounded-xl transition-colors duration-200 ease-in-out hover:border-emerald-300 hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50">
                        <ShinyText text="Get Started" disabled={false} speed={3} className='custom-class' />
                    </button>
                </div>
            </div>

                <div className="particles-container" style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%',
                    zIndex: 1 
                }}>
                    <Aurora
                    colorStops={["#545454", "#474747", "#474747"]}
                    speed={0.5}
                    />
                </div>

            </div>
        </div>
    )
}