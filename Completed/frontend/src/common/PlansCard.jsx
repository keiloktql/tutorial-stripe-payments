import React from 'react';
import { useHistory } from 'react-router-dom';

const PlansCard = ({ name, price, description, planID }) => {

    const history = useHistory();

    return (
        <div className={`c-Plans-card c-Plans-card--${name}`}>
            <div className="c-Plans-Card__Title">
                <h1>{name || "Error"}</h1>
            </div>
            <div className="c-Plans-card__Price">
                <h1>S${price || "Error"}</h1>
                <p>per month</p>
            </div>
            <div className="c-Plans-card__Description">
                <p>{description || "Error"}</p>
            </div>
            <div className="c-Plans-card__Btn">
                <button type="button" onClick={() => history.push(`/plans/payment/${name?.toLowerCase()}`)}>Get Started</button>
            </div>
            <div className = "c-Plans-card__Free-trial">
                <p><i><b>7 Day Free Trial</b> for first time subscribers</i></p>
            </div>
        </div>
    )
}

export default PlansCard;