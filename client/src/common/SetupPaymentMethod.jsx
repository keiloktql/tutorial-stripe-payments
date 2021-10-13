import React, { useState, useEffect } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { getToken } from '../utilities/localStorageUtils';
import axios from 'axios';
import config from '../config/config';
import Spinner from 'react-bootstrap/Spinner'

const SetupPaymentMethod = ({ show, handleClose, setRerender }) => {

    const [cardSetupError, setCardSetupError] = useState(null);
    const [cardSetupProcessing, setCardSetupProcessing] = useState(false);
    const [cardSetupDisabled, setCardSetupDisabled] = useState(true);
    const [cardSetupSuccess, setCardSetupSuccess] = useState(false);
    const [setupIntentID, setSetupIntentID] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const token = getToken();

    useEffect(() => {
        let componentMounted = true;

        (async () => {
            try {
                if (componentMounted) {
                    if (show) {
                        // Retrieve client secret here
                        const setupIntent = await axios.post(`${config.baseUrl}/stripe/setup_intents`, {}, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        console.log(setupIntent);
                        setClientSecret(() => setupIntent.data.clientSecret);
                        setSetupIntentID(() => setupIntent.data.setupIntentID);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        })()

        return (() => {
            componentMounted = false;
        });
    }, [show]);

    const stripe = useStripe();
    const elements = useElements();

    const showHideClassName = show ? "l-Setup-payment-method l-Setup-payment-method--show" : "l-Setup-payment-method l-Setup-payment-method--hidden";

    const CARD_ELEMENT_OPTIONS = {
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        elements.getElement(CardElement).update({ disabled: true });
        setCardSetupProcessing(() => true);

        if (!stripe || !elements || !clientSecret || !setupIntentID) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            setCardSetupProcessing(() => false);
            elements.getElement(CardElement).update({ disabled: false });
            setCardSetupError(() => "Error! Please try again later!");
        } else {
            const result = await stripe.confirmCardSetup(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)
                },
            });

            if (result.error) {
                setCardSetupError(() => result.error.message);
                setCardSetupProcessing(() => false);
                // Display result.error.message in your UI.
                elements.getElement(CardElement).update({ disabled: false });
            } else {
                // The setup has succeeded. Display a success message and send
                // result.setupIntent.payment_method to your server to save the
                // card to a Customer

                // Obtain payment method id
                const paymentMethodID = result.setupIntent.payment_method;

                try {
                    await axios.post(`${config.baseUrl}/stripe/payment_methods`, {
                        paymentMethodID
                    }, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    elements.getElement(CardElement).clear();
                    setRerender((prevState) => !prevState);    // tell parent component to rerender to see changes
                    setCardSetupSuccess(() => true);
                    setCardSetupProcessing(() => false);
                    setCardSetupError(() => null);

                } catch (error) {
                    console.log(error);
                    const duplicate = error.response?.data.duplicate;
                    if (duplicate) {
                        setCardSetupError(() => error.response.data.message);
                    } else {
                        setCardSetupError(() => "Error! Please try again later!");
                    }
                    setCardSetupProcessing(() => false);

                    elements.getElement(CardElement).update({ disabled: false });

                }

            }
        }
    };

    const handleBtn = () => {
        // Clear stripe element before closing
        if (elements?.getElement(CardElement)) {
            elements.getElement(CardElement).clear();
        }
        handleClose();
    };

    const handleCardInputChange = async (event) => {
        // Listen for changes in the CardElement
        // and display any errors as the customer types their card details

        if (event.complete) {
            setCardSetupDisabled(() => false);
        } else {
            setCardSetupDisabled(() => true);
        }

        setCardSetupError(event.error ? event.error.message : "");
    };

    return (
        <form className={showHideClassName} onSubmit={(event) => handleSubmit(event)}>
            {
                cardSetupSuccess ?
                    // Card set up success component
                    <div className="c-Setup-payment-method c-Setup-payment-method__Success">
                        <span>
                            <svg viewBox="0 0 24 24">
                                <path strokeWidth="2" fill="none" stroke="#ffffff" d="M 3,12 l 6,6 l 12, -12" />
                            </svg>
                        </span>
                        <h1>Card Added Successfully!</h1>
                        <button type="button" className="c-Btn c-Btn--stripe-purple-empty" onClick={() => handleBtn()}>Close</button>
                    </div>
                    :

                    <div className="c-Setup-payment-method">
                        <h1>Add Payment Method</h1>
                        <div className="l-Setup-payment-method__Card-element">
                            <div className={cardSetupProcessing ? "c-Setup-payment-method__Card-element c-Setup-payment-method__Card-element--disabled" : "c-Setup-payment-method__Card-element"}>
                                {/* Card input is rendered here */}
                                <CardElement options={CARD_ELEMENT_OPTIONS} onChange={handleCardInputChange} />
                            </div>
                        </div>
                        {/* Show any error that happens when setting up the payment method */}
                        {cardSetupError && (
                            <div className="card-error" role="alert">
                                {cardSetupError}
                            </div>
                        )}
                        <div className="c-Setup-payment-method__Btn">
                            <button disabled={cardSetupProcessing || cardSetupDisabled} type="button" className={cardSetupProcessing || cardSetupDisabled ? "c-Btn c-Btn--disabled" : "c-Btn"} onClick={(event) => handleSubmit(event)}>
                                {cardSetupProcessing ? (
                                    <>
                                        <span> Processing </span>
                                        <Spinner animation="border" role="status" />
                                    </>
                                ) : (
                                    <>
                                        Save
                                    </>
                                )}
                            </button>
                            <button disabled={cardSetupProcessing} type="button" className="c-Btn c-Btn--empty" onClick={() => handleBtn()}>Cancel</button>
                        </div>
                    </div>


            }
        </form>


    )
}

export default SetupPaymentMethod;