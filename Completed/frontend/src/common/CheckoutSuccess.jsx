import React from 'react';
import { NavLink } from 'react-router-dom';

const CheckoutSuccess = ({description}) => {
    return (
        <div className="c-Checkout-success">
            <span>
                <svg viewBox="0 0 24 24">
                    <path strokeWidth="2" fill="none" stroke="#ffffff" d="M 3,12 l 6,6 l 12, -12" />
                </svg>
            </span>
            <h1>Checkout Successful!</h1>
            <p>{description ? description : "View payment details in the Stripe Dashboard"}</p>
            <p><NavLink to="/home">Back to Home</NavLink></p>
        </div>
    )
}

export default CheckoutSuccess;