import React from 'react';

const CustomConfirmAlert = ({ message, type = "stripe-purple", handler, heading, onClose }) => {
    return (
        <div className='c-Confirm-alert'>
            <h1>{heading}</h1>
            <p>{message}</p>
            <div className='c-Confirm-alert__Buttons'>
                <button className={"c-Btn c-Btn--" + type} onClick={() => (handler(onClose))}>Confirm</button>
                <button className="c-Btn c-Btn--empty" onClick={onClose}> Cancel</button>
            </div>
        </div>
    );
}
export default CustomConfirmAlert;