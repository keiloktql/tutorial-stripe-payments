import React from 'react';
import * as BiIcons from 'react-icons/bi';
import { IconContext } from 'react-icons';

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
                            <IconContext.Provider value={{ color: "#ffffff", size: "30px" }}>
                                <BiIcons.BiWorld className="c-Btn__Globe" />
                            </IconContext.Provider>
                            Singapore
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer;