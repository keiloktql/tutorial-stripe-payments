import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router';
import PageLayout from "../layout/PageLayout";
import SetupPaymentMethod from '../common/SetupPaymentMethod';
import SelectPaymentMethod from '../common/SelectPaymentMethod';
import { useStripe } from "@stripe/react-stripe-js";
import config from '../config/config';
import { getToken } from '../utilities/localStorageUtils';
import Spinner from 'react-bootstrap/Spinner';
import * as BiIcons from 'react-icons/bi';
import { IconContext } from 'react-icons';
import CheckoutSuccess from '../common/CheckoutSuccess';
import jwt_decode from "jwt-decode";


const PlansCheckout = ({ match }) => {
    const history = useHistory();
    const token = getToken();
    let accountID;
    if (token) {
        const decodedToken = jwt_decode(token);
        accountID = decodedToken.account_id;
    }

    let displayPrice;

    let type = match.params.type;
    if (type) {
        if (type === "standard" || type === "premium") {
            type = type.charAt(0).toUpperCase() + type.slice(1);

            if (type === "standard") {
                displayPrice = "9.90";
            } else {
                displayPrice = "15.90";
            }
        }
        else {
            history.push("/page-not-found");
        }

    } else {
        history.push("/page-not-found");
    }

    const [rerender, setRerender] = useState(false);
    const [showSetupPaymentMethod, setShowSetupPaymentMethod] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);

    // Stripe
    const [paymentError, setPaymentError] = useState(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentDisabled, setPaymentDisabled] = useState(true);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [subscriptionID, setSubscriptionID] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const stripe = useStripe();

    useEffect(() => {
        let componentMounted = true;

        (async () => {
            try {
                const accountResponse = await axios.get(`${config.baseUrl}/account/${accountID}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const accountData = accountResponse.data;
    
                if (componentMounted) {
                    // Check if user has any payment methods type stored already

                    // Check if there is subscription id
                    
                }
            } catch (error) {
                console.log(error);
                const errCode = error.response.status;
                if (errCode === 401) {
                    history.push("/logged-out");
                }
            }
            
        })();

        return (() => {
            componentMounted = false;
        });

    }, [rerender]);

    // Handlers
    const handleShowSetupPaymentMethod = () => {
        setShowSetupPaymentMethod((prevState) => !prevState);
        setSelectedPaymentMethod(() => null);
    };

    const handleSelectPaymentMethod = (stripePaymentMethodID) => {
        if (stripePaymentMethodID === selectedPaymentMethod) {
            setSelectedPaymentMethod(() => null);
        } else {
            setSelectedPaymentMethod(() => stripePaymentMethodID);
        }
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        setPaymentProcessing(() => true);

        if (selectedPaymentMethod) {
            const payload = await stripe.confirmCardPayment(clientSecret, {
                payment_method: selectedPaymentMethod
            });

            if (payload.error) {
                 // Payment error
                setPaymentError(() => `Payment failed! ${payload.error.message}`);
                setPaymentProcessing(() => false);
            } else {
                 // Payment success
                setPaymentError(() => null);
                setPaymentProcessing(false);
                setPaymentSuccess(() => true);
            }
        }

    };


    return (
        <>
            <SetupPaymentMethod show={showSetupPaymentMethod} handleClose={handleShowSetupPaymentMethod} setRerender={setRerender} />
            <PageLayout>
                <div className="c-Plans-checkout">
                    {
                        paymentSuccess ?
                            <CheckoutSuccess description={`You are now subscribed to ${type} plan!`} /> :
                            <>
                                <div className="c-Plans-checkout__Heading">
                                    <h1>You are subscribing to <b>{type}</b> plan.</h1>
                                    <p>In this demo, we require users to add a card first for payment</p>
                                </div>


                                {/* Form */}
                                <form className="c-Plans-checkout__Payment-details" onSubmit={handleFormSubmit}>
                                    <div className="c-Plans-checkout__Card-info">
                                        <h2>Payment Mode</h2>
                                        {
                                            paymentMethods.length > 0 ?
                                                paymentMethods.map((paymentMethod, index) => (
                                                    <div className="c-Card-info__Payment-methods" key={index}>
                                                        <SelectPaymentMethod index={index} cardBrand={paymentMethod.cardBrand} last4={paymentMethod.last4} expDate={paymentMethod.expDate} stripePaymentMethodID={paymentMethod.stripePaymentMethodID} selectedPaymentMethod={selectedPaymentMethod} handleSelectPaymentMethod={handleSelectPaymentMethod} disabled={paymentProcessing} />
                                                    </div>
                                                ))
                                                :
                                                <p>No payment methods found.</p>
                                        }

                                        <div className={paymentProcessing ? "l-Card-info__Add-card l-Card-info__Add-card--disabled" : "l-Card-info__Add-card"}>
                                            <div className={paymentProcessing ? "c-Card-info__Add-card c-Card-info__Add-card--disabled" : "c-Card-info__Add-card"} onClick={handleShowSetupPaymentMethod}>
                                                <p>
                                                    <IconContext.Provider value={{ color: "#172b4d", size: "21px" }}>
                                                        <BiIcons.BiCreditCard className="c-Add-card__Icon" />
                                                    </IconContext.Provider>
                                                    Add Credit / Debit Card
                                                </p>
                                            </div>
                                        </div>

                                        {/* Show any error that happens when processing the payment */}
                                        {paymentError && (
                                            <div className="card-error" role="alert">
                                                {paymentError}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        disabled={paymentProcessing || paymentDisabled}
                                        className="c-Btn c-Btn--stripe-purple"
                                        type="submit"
                                    >
                                        {paymentProcessing ? (
                                            <>
                                                <Spinner animation="border" role="status" />
                                            </>
                                        ) : (
                                            <>
                                                Pay S${displayPrice}
                                            </>
                                        )}
                                    </button>
                                    <button
                                        disabled={paymentProcessing}
                                        className="c-Btn c-Btn--stripe-primary"
                                        onClick={() => history.push("/plans")}
                                        type="button"
                                    >Back to Plans
                                    </button>
                                </form>
                            </>
                    }
                </div>
            </PageLayout>
        </>
    )
}

export default PlansCheckout;