import React, { useState, useEffect } from "react";
import Header from "../layout/Header";
import Title from "../layout/Title";
import axios from "axios";
import { getToken } from '../utilities/localStorageUtils';
import config from '../config/config';
import { ToastContainer } from "react-toastify";
import useComponentVisible from "../hooks/useComponentVisible";
import {
    CardElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { handleCopyToClipboard } from "../utilities/copyToClipboardUtils";
import jwt_decode from "jwt-decode";
import CheckoutSuccess from '../common/CheckoutSuccess';
import Spinner from 'react-bootstrap/Spinner';
import PageLayout from "../layout/PageLayout";

const Checkout = () => {

    const toastTiming = config.toastTiming;
    const token = getToken();
    let accountID;
    if (token) {
        const decodedToken = jwt_decode(token);
        accountID = decodedToken.account_id;
    }

    const cardStyle = {
        hidePostalCode: true,
        style: {
            base: {
                color: "#32325d",
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: "antialiased",
                fontSize: "16px",
                "::placeholder": {
                    color: "#32325d",
                }
            },
            invalid: {
                color: "#fa755a",
                iconColor: "#fa755a"
            }
        },
    };

    // State declarations
    const [viewTestScenario, setViewTestScenario] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentDisabled, setPaymentDisabled] = useState(true);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentIntentID, setPaymentIntentID] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const stripe = useStripe();
    const elements = useElements();

    const { ref } = useComponentVisible(
        viewTestScenario,
        setViewTestScenario
    );

    useEffect(() => {
        let componentMounted = true;

        (async () => {

            try {
                // Get info for account
                const accountResponse = await axios.get(`${config.baseUrl}/account/${accountID}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (componentMounted) {
                    const accountData = accountResponse.data.account;

                    // Check if user has client secret and payment intent
                    if (accountData.stripe_payment_intent_id === null) {

                        // Create new payment intent
                        const paymentIntent = await axios.post(`${config.baseUrl}/stripe/payment_intents`, {
                            items: [1] // hardcoded the id of 'iPhone 15' product from our database
                        }, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        setClientSecret(() => paymentIntent.data.clientSecret);
                        setPaymentIntentID(() => paymentIntent.data.paymentIntentID);
                    } else {
                        // Retrieve existing payment intent and client secret
                        setClientSecret(() => (accountData.stripe_payment_intent_client_secret));
                        setPaymentIntentID(() => accountData.stripe_payment_intent_id);

                        // Update payment intent
                        await axios.put(`${config.baseUrl}/stripe/payment_intents`, {
                            paymentIntentID,
                            items: [1] // hardcoded the id of 'iPhone 15' product from our database
                        }, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                    }
                }

            } catch (error) {
                console.log(error);
                // Optional: Set error state and display error page to user
            }

        })();

        return (() => {
            componentMounted = false;
        });
    }, []);

    // Handlers
    const handleCardInputChange = async (event) => {
        // Listen for changes in the CardElement and display any errors as the customer types their card details
        if (event.complete) {
            setPaymentDisabled(false);
        } else {
            setPaymentDisabled(true);
        }
        setPaymentError(event.error ? event.error.message : "");
    };

    const handleTestScenarioClick = () => {
        setViewTestScenario((prevState) => !prevState);
    };

    // Confirm card payment
    const handleFormSubmit = async (event) => {
        event.preventDefault(); // prevent page from refreshing
        setPaymentProcessing(() => true); // show loading UI

        const payload = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement)
            },
        });

        // Check for errors
        if (payload.error) {
            setPaymentError(() => `Payment failed! ${payload.error.message}`);
            setPaymentProcessing(() => false);
        } else {
            setPaymentError(() => null);
            setPaymentProcessing(false);
            setPaymentSuccess(() => true);
        }
    };

    return (
        <PageLayout title="Checkout">
            <div className="c-Checkout">
                {
                    paymentSuccess ?
                        <CheckoutSuccess /> :
                        <>
                            <h1>One Time Payment Demo</h1>
                            <p>Click on "Test Scenarios" to copy test cards</p>
                            <form className="c-Checkout__Payment-info" onSubmit={(event) => handleFormSubmit(event)}>
                                <div className="c-Checkout__Card-element">
                                    <CardElement options={cardStyle} onChange={handleCardInputChange} />
                                </div>
                                <button type="submit" className="c-Btn c-Btn--stripe-purple">
                                    {paymentProcessing ? (
                                        <>
                                            <Spinner animation="border" role="status" />
                                        </>
                                    ) : (
                                        <>
                                            Pay S$1299.90
                                        </>
                                    )}
                                    </button>

                                {/* Show any error that happens when processing the payment */}
                                {paymentError && (
                                    <div className="card-error" role="alert">
                                        {paymentError}
                                    </div>
                                )}
                            </form>
                            <div className="c-Checkout__Test-cards" ref={ref}>
                                <span className="c-Test-cards__Tooltip-title" onClick={handleTestScenarioClick}>
                                    Test Scenarios
                                </span>
                                {
                                    viewTestScenario ? (
                                        <div className="l-Test-cards__Tooltip">
                                            <div className="c-Test-cards__Tooltip">
                                                <div className="c-Test-cards__Info">
                                                    <p>Payment Succeeds</p>
                                                    <h1 onClick={() => handleCopyToClipboard("4242424242424242")}>4242 4242 4242 4242</h1>
                                                </div>
                                                <div className="c-Test-cards__Info">
                                                    <p>Authentication required</p>
                                                    <h1 onClick={() => handleCopyToClipboard("4000002500003155")}>4000 0025 0000 3155</h1>
                                                </div>
                                                <div className="c-Test-cards__Info">
                                                    <p>Payment is declined</p>
                                                    <h1 onClick={() => handleCopyToClipboard("4000000000009995")}>4000 0000 0000 9995</h1>
                                                </div>
                                                <div className="c-Test-cards__Info">
                                                    <p>These test card numbers work with any CVC, postal code and future expiry date.</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) :
                                        null
                                }

                            </div>
                        </>
                }
            </div>

        </PageLayout>
    )
}

export default Checkout;