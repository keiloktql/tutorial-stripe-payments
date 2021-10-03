import React from 'react';

const Footer = () => {
    return (
        <footer className="l-Footer">
            <div className='c-Footer'>
                <div className="c-Footer__Top c-Top">
                    <div className="c-Top__Left">
                        <h1>Deluxe</h1>
                        <p>Exclusive Club</p>
                    </div>
                </div>
                <hr />
                <div className="c-Footer__Bottom c-Bottom">
                    <p>Deluxe 2021. Built By Kei Lok.</p>
                    <a href="https://github.com/keilokimnida/tutorial-stripe-payments" target="_blank" rel="noopener noreferrer">GitHub Repo</a>
                </div>
            </div>
        </footer>
    )
}

export default Footer;