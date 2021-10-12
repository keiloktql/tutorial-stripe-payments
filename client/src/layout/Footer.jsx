import React from 'react';
import flagSG from '../assets/images/flag-sg.png';

const Footer = () => {
    return (
        <footer className="l-Footer">
            <div className='c-Footer'>
                <div className="c-Footer__Top c-Top">
                    <div className="c-Top__Left">
                        <h1>Deluxe</h1>
                        <a href="https://github.com/keilokimnida/tutorial-stripe-payments" target="_blank" rel="noopener noreferrer">View GitHub Repo</a>
                    </div>

                </div>
                <hr />
                <div className="c-Footer__Bottom c-Bottom">
                    <div className="c-Bottom__Left">
                        <p>Deluxe 2021. Built By Kei Lok.</p>
                    </div>
                    <div className="c-Bottom__Right">
                        <p>
                            <img src = {flagSG} alt = "SG" />
                            Singapore
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer;