import React from "react";
import { useNavigate } from 'react-router-dom';
import './landing.css';
import Aurora from '../components/Backgrounds/Aurora/Aurora';
import StarBorder from '../components/StarBorder/StarBorder';
import ShinyText from '../components/TextAnimations/ShinyText/ShinyText';

export default function LandingPage() {
    const navigate = useNavigate();

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return(
        <div>
            <div className="container-landingpage">
                <div className="navigation-bar">
                    <div className="TopLeft">
                        <h1>TeamMate</h1>
                    </div>
                    <div className="TopCenter">
                        <a 
                            href="#about" 
                            className="TopLinks" 
                            onClick={(e) => {
                                e.preventDefault();
                                scrollToSection('about');
                            }}
                        >
                            About Us
                        </a>
                        <a href="/" className="TopLinks">FAQ</a>
                        <a href="/" className="TopLinks">Support</a>
                    </div>
                    <div className="TopRight">
                        <button className="ButtonLogin">
                            Log In
                        </button>
                    </div>
                </div>

                <main className="LandingPageBody">
                    {/* Get Started Section at Top */}
                    <div className="LandingSection">
                        <h1 className="text-4xl font-bold text-emerald-400 mb-4">Get Started Today!</h1>
                        <p className="text-xl text-gray-300 mb-8 text-center">
                            Join the future of education with TeamMate. Sign up now and start teaching smarter, not harder!
                        </p>
                        <button 
                            onClick={() => navigate('/dashboard')} 
                            className="text-xl px-5 py-4 border-2 border-white/100 rounded rounded-xl transition-colors duration-200 ease-in-out hover:border-emerald-300 hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50"
                        >
                            <ShinyText text="Get Started" disabled={false} speed={3} className='custom-class' />
                        </button>
                    </div>

                    {/* Work Assignments Section */}
                    <div className="LandingSection">
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

                    {/* About Us Section at Bottom */}
                    <div id="about" className="LandingSection">
                        <h1 className="section-title">About TeamMate</h1>
                        <div className="about-content">
                            <p className="section-text">
                                TeamMate revolutionizes online education through an all-in-one platform combining 
                                task management, real-time collaboration, and seamless communication.
                            </p>
                            
                            <div className="features-grid">
                                <div className="feature-card">
                                    <h3>Our Mission</h3>
                                    <p>Empower educators and students with productivity-enhancing tools for meaningful learning experiences.</p>
                                </div>
                                
                                <div className="feature-card">
                                    <h3>Collaboration</h3>
                                    <p>Real-time whiteboard integration for interactive concept visualization and brainstorming.</p>
                                </div>

                                <div className="feature-card">
                                    <h3>Connectivity</h3>
                                    <p>Direct messaging and smart notifications keep everyone aligned and informed.</p>
                                </div>

                                <div className="feature-card">
                                    <h3>Why Choose Us</h3>
                                    <p>All-in-one secure platform with intuitive interface and cross-platform accessibility.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
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
                colorStops={["#00c9bd", "#474747", "#00c9bd"]}
                speed={0.5}
                />
            </div>
        </div>
    )
}