import React from 'react';
import * as HiIcons from 'react-icons/hi';
import { IconContext } from 'react-icons';

const Button = ({ variation, text, type }) => {

    return (
        <button type={type ? type : "button"} className={`c-Btn c-Btn--${variation ? variation : "stripe-purple"}`}>
            {text ? text : "Button"}
            <IconContext.Provider value={{ color: "#ffffff", size: "30px" }}>
                <HiIcons.HiArrowSmRight className="c-Btn__Arrow" />
            </IconContext.Provider>
        </button>
    )
}

export default Button;