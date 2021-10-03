import React, { useState, useEffect } from "react";
import Header from "../layout/Header";
import Title from "../layout/Title";
import productImg from '../assets/images/iphone_15_orange.jpg';
import axios from "axios";
import { getToken } from '../utilities/localStorageUtils';
import config from '../config/config';
import ProductCard from "../common/ProductCard";
import useComponentVisible from "../hooks/useComponentVisible";
import {
    CardElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";

const Checkout = () => {

    const token = getToken();

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
    const [productInfo, setProductInfo] = useState({
        id: null,
        name: null,
        description: null,
        price: null,
        imageLink: null
    });
    const [viewTestCardModal, setViewTestCardModal] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentDisabled, setPaymentDisabled] = useState(true);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentIntentID, setPaymentIntentID] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const stripe = useStripe();
    const elements = useElements();

    const { ref } = useComponentVisible(
        viewTestCardModal,
        setViewTestCardModal
    );

    useEffect(() => {
        let componentMounted = true;

        (async () => {

            try {
                // Get product information
                const productsResponse = await axios.get(`${config.baseUrl}/products`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (componentMounted) {
                    const productsData = productsResponse.data;

                    if (productsData.length > 0) {
                        setProductInfo(() => ({
                            id: productsData[0].product_id,
                            name: productsData[0].name,
                            description: productsData[0].description,
                            price: productsData[0].price,
                            imageLink: productsData[0].imageLink
                        }));
                    }
                }
            } catch (error) {
                console.log(error);
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

    const handleTestCardClick = () => {
        setViewTestCardModal((prevState) => !prevState);
    };

    const handleCopyToClipboard = (copyText) => {
        navigator.clipboard.writeText(copyText);
    };

    return (
        <>
            <Title title="Checkout" />
            <Header />
            <div className="c-Checkout" ref={ref}>
                <h1>One Time Payment Demo</h1>
                <p>Click on "Test Cards Available" to copy test card numbers</p>
                <div className="c-Checkout__Payment-info">
                    <div className="c-Checkout__Card-element">
                        <CardElement options={cardStyle} onChange={handleCardInputChange} />
                    </div>
                    <button type="button" className="c-Btn c-Btn--stripe-purple">Pay S${productInfo.price ? productInfo.price : "Error"}</button>
                </div>
                <span className="c-Checkout__Test-cards" onClick={handleTestCardClick}>
                    Test Cards
                </span>
                {
                    viewTestCardModal ? (
                        <div classname="c-Test-cards__Tooltip">
                            <div className="c-Test-cards__Info">
                                <p>Payment Succeeds</p>
                                <h1>4242 4242 4242 4242</h1>
                            </div>
                            <div className="c-Test-cards__Info">
                                <p>Authentication required</p>
                                <h1>4000 0025 0000 3155</h1>
                            </div>
                            <div className="c-Test-cards__Info">
                                <p>Payment is declined</p>
                                <h1>4000 0000 0000 9995</h1>
                            </div>
                            <div className="c-Test-cards__Info">
                                <p>These test card numbers work with any CVC, postal code and future expiry date.</p>
                            </div>
                        </div>
                    ) :
                        null
                }

            </div>

        </>
    )
}

export default Checkout;