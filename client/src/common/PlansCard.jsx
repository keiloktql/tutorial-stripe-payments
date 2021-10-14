import React from 'react';
import { useHistory } from 'react-router-dom';

const PlansCard = ({ name, price, description, planID, mode = "static", currentPlan, onClickHandler }) => {
    console.log(planID);
    console.log(currentPlan);
    console.log("planID" + planID + " :");
    console.log("currentPlan" + currentPlan + " :");
    console.log(planID === currentPlan);
    const history = useHistory();

    const renderPlansCard = () => {
        if (mode === "static") {
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
                </div>
            )
        } else {
            return (<div className={`c-Plans-card c-Plans-card--${name}`}>
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
                    {
                        currentPlan ?
                            currentPlan === planID ?
                                <button type="button" disabled className="c-Btn c-Btn--stripe-purple">Current Plan</button>
                                :
                                <button type="button" onClick={() => onClickHandler(name)}>Change Plan</button>
                            :
                            <p>Loading...</p>
                    }
                </div>
            </div>
            );
        }
    }

    return (
        <>
            {renderPlansCard()}
        </>
    )
}

export default PlansCard;