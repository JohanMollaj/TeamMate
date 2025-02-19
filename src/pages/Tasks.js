import './tasks.css';
import React, { useState, useEffect } from 'react';

export default function(){
    return(
        <div>
            <div className="container-tasks">
                {/* Dashboard */}
                <div className="wrapper tasks">
                <div  className='TasksHeader'>
                            <h1>Tasks</h1>
                        </div>
                    <div className='sections'>
                        
                        <div className="section overview">
                            <h2>Overview</h2>
                        </div>

                        <div className="section assignments">
                            <h2>Assignments</h2>
                            <p>You have finished all your tasks!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}