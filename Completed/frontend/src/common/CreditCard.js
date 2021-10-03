import React from 'react';
import * as FcIcons from 'react-icons/fc';
import { IconContext } from 'react-icons';
import visaWhite from "../assets/images/visa-white.png";

const CreditCard = ({ last4, expDate }) => {

    return (
        <div className="c-Credit-card c-Credit-card--bg-var-1">
            <div className="c-Credit-card__Logo">
                <div className="c-Credit-card__IMG c-IMG__Visa">
                    <img src={visaWhite} alt="Credit Card Brand" />
                </div>
            </div>
            <div className="c-Credit-card__Chip">
                <IconContext.Provider value={{ color: "#a41c4e", size: "34px" }}>
                    <FcIcons.FcSimCardChip />
                </IconContext.Provider>
            </div>
            <div className="c-Credit-card__Num">
                <p>●●●● ●●●● ●●●● {last4}</p>
            </div>
            <div className="c-Credit-card__Bottom">
                <h1>VALID<br />THRU</h1>
                <p>{expDate ? expDate : "Error"}</p>
            </div>
        </div>
    )
}

export default CreditCard;