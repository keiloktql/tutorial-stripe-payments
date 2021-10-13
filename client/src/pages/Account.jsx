import React, { useState, useEffect } from 'react';
import config from '../config/config';
import { toast, ToastContainer } from 'react-toastify';
import jwt_decode from "jwt-decode";
import { getToken } from '../utilities/localStorageUtils';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import BootstrapTable from 'react-bootstrap-table-next';
import dayjs from 'dayjs';
import MCSVG from "../assets/svg/MC.svg";
import visaSVG from "../assets/svg/Visa_2021.svg";
import amexSVG from "../assets/svg/Amex.svg";
import { ReactSVG } from 'react-svg';
import SetupPaymentMethod from '../common/SetupPaymentMethod';
import PageLayout from '../layout/PageLayout';
import Chip from '@mui/material/Chip';

const Account = () => {

    const toastTiming = config.toastTiming;
    const token = getToken();
    let accountID;
    if (token) {
        const decodedToken = jwt_decode(token);
        accountID = decodedToken.account_id;
    }

    // State declarations
    const [profileData, setProfileData] = useState({
        firstName: null,
        lastName: null,
        email: null,
        username: null
    });
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [billingHistory, setBillingHistory] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [showSetupPaymentMethod, setShowSetupPaymentMethod] = useState(false);
    const [rerender, setRerender] = useState(false);

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

                    if (accountData.account) {
                        setProfileData(() => ({
                            email: accountData.account.email,
                            username: accountData.account.username
                        }));
                        setPaymentMethods(() => accountData.account.payment_accounts.map((paymentAccount, index) => ({
                            serialNo: index + 1,
                            paymentMethodID: paymentAccount.payment_methods_id,
                            cardType: paymentAccount.stripe_card_type,
                            cardLastFourDigit: paymentAccount.stripe_card_last_four_digit,
                            expDate: paymentAccount.stripe_card_exp_date,
                            bgVar: paymentAccount.card_bg_variation,
                            createdAt: dayjs(new Date(paymentAccount.created_at)).format("MMMM D, YYYY h:mm A"),
                        })));

                    }

                    setLoading(() => false);
                }

            } catch (error) {
                console.log(error);
                if (componentMounted) {
                    setProfileData(() => ({
                        firstName: "Error",
                        lastName: "Error",
                        email: "Error",
                        username: "Error"
                    }));
                    setLoading(() => false);
                }
            }

        })();

        return (() => {
            componentMounted = false;
        });
    }, [rerender]);

    const paymentHistoryColumn = [
        {
            dataField: 'orderID',
            text: 'Id',
            hidden: true
        },
        {
            dataField: 'serialNo',
            text: '#',
        },
        {
            dataField: 'amount',
            text: 'Amount',
        },
        {
            dataField: 'cardType',
            text: 'Card Type',
            formatter: (cell, row) => {
                if (cell === "visa") {
                    return <ReactSVG
                        src={visaSVG}
                        className="c-Payment-history__SVG c-SVG__Visa"
                    />
                } else if (cell === "mastercard") {
                    return <ReactSVG
                        src={MCSVG}
                        className="c-Payment-history__SVG c-SVG__Master"
                    />
                } else if (cell === "amex") {
                    return <ReactSVG
                        src={amexSVG}
                        className="c-Payment-history__SVG c-SVG__Amex"
                    />
                } else {
                    return cell;
                }
            }
        },
        {
            dataField: 'cardLastFourDigit',
            text: 'Last 4 Digit',
            formatter: (cell) => (
                "●●●● " + cell
            )
        },
        {
            dataField: 'createdAt',
            text: 'Paid on'
        }
    ];
    const paymentMethodsColumn = [
        {
            dataField: 'paymentMethodID',
            text: 'Id',
            hidden: true
        },
        {
            dataField: 'serialNo',
            text: '#',
        },
        {
            dataField: 'cardType',
            text: 'Card Type',
            formatter: (cell, row) => {
                if (cell === "visa") {
                    return <ReactSVG
                        src={visaSVG}
                        className="c-Payment-history__SVG c-SVG__Visa"
                    />
                } else if (cell === "mastercard") {
                    return <ReactSVG
                        src={MCSVG}
                        className="c-Payment-history__SVG c-SVG__Master"
                    />
                } else if (cell === "amex") {
                    return <ReactSVG
                        src={amexSVG}
                        className="c-Payment-history__SVG c-SVG__Amex"
                    />
                } else {
                    return cell;
                }
            }
        },
        {
            dataField: 'cardLastFourDigit',
            text: 'Last 4 Digit',
            formatter: (cell) => (
                "●●●● " + cell
            )
        },
        {
            dataField: 'createdAt',
            text: 'Added on'
        },
        {
            dataField: 'action_delete',
            text: '',
            isDummyField: true,
            formatter: (cell, row) => {
                return <p onClick={() => handleRemoveCard(row.paymentMethodID)}>Remove Card</p>
            }
        }
    ];

    const renderCardLogo = (cardType) => {
        if (cardType === "visa") {
            return <ReactSVG
                src={visaSVG}
                className="c-Payment-history__SVG c-SVG__Visa"
            />
        } else if (cardType === "mastercard") {
            return <ReactSVG
                src={MCSVG}
                className="c-Payment-history__SVG c-SVG__Master"
            />
        } else if (cardType === "amex") {
            return <ReactSVG
                src={amexSVG}
                className="c-Payment-history__SVG c-SVG__Amex"
            />
        } else {
            return cardType;
        }
    };

    const handleShowPaymentMethod = () => {
        setShowSetupPaymentMethod((prevState) => !prevState);
    };

    const handleRemoveCard = (paymentMethodID) => {
        // To do handle remove card here
    };

    return (
        <>
            <SetupPaymentMethod show={showSetupPaymentMethod} handleClose={handleShowPaymentMethod} setRerender={setRerender} />
            <PageLayout>
                <div className="c-Account">
                    {/* Profile */}
                    <div className="c-Account__Profile">
                        <div className="c-Account__Heading">
                            <div className="c-Heading__Text">
                                <h1>Profile</h1>
                                <p>Edit account not available.</p>
                            </div>
                            <div className="c-Heading__Btn">
                                <button type="button" className="c-Btn">Edit</button>
                            </div>
                        </div>
                        <hr />
                        <div className="c-Profile__Details">
                            <div className="c-Profile__Labels">
                                <label htmlFor="email">Email</label>
                                <label htmlFor="username">Username</label>
                            </div>
                            <div className="c-Profile__Info">
                                <p>{profileData.email || "Error"}</p>
                                <p>{profileData.username || "Error"}</p>
                            </div>
                        </div>
                    </div>
                    {/* Payment methods */}
                    <div className="c-Account__Payment-method">
                        <div className="c-Account__Heading">
                            <div className="c-Heading__Text">
                                <h1>Payment Methods</h1>
                                <p>Add credit card demo.</p>
                            </div>
                            <div className="c-Heading__Btn">
                                <button type="button" className="c-Btn" onClick={handleShowPaymentMethod}>Add</button>
                            </div>
                        </div>
                        <hr />
                        {
                            paymentMethods.length === 0 ?
                                <p>No Payment Methods Found!</p>
                                :
                                <>
                                    {/* Payment method table */}

                                    <div className="c-Account__Payment-method-table">
                                        <BootstrapTable
                                            bordered={false}
                                            keyField="serialNo"
                                            data={paymentMethods}
                                            columns={paymentMethodsColumn}
                                        />
                                    </div>
                                </>
                        }

                    </div>
                    {/* Payment history */}
                    <div className="c-Account__Payment-history">
                        <div className="c-Account__Heading">
                            <div className="c-Heading__Text">
                                <h1>Payment History</h1>
                                <p>This demo does not contain payment history feature.</p>
                            </div>
                        </div>
                    </div>

                    {/* Subscription */}
                    <div className="c-Account__Subscription c-Subscription">
                        <div className="c-Account__Heading">
                            <div className="c-Heading__Text">
                                <h1>Subscription</h1>
                            </div>
                        </div>
                        <hr />
                        <div className="l-Subscription__Info">
                            <h2>Current Billing Cycle: 1st July - 30th July</h2>
                            <div className="c-Subscription__Info c-Info">
                                <div className="c-Info__Card">
                                    <h2>Current Plan</h2>
                                    <h3>Standard</h3>
                                    <p>S$9.90 per month</p>
                                    <Chip className = "c-Info__Card-chip" label="Active" color="warning" />
                                </div>
                                <div className="c-Info__Btns">
                                    <button type="button" className="c-Btn c-Btn--stripe-purple">Change Plan</button>
                                    <button type="button" className="c-Btn c-Btn--stripe-purple-border">Cancel Subscription</button>
                                </div>
                            </div>
                        </div>

                        <div className="l-Subscription__Payment-method">
                            <div className="c-Subscription__Payment-method c-Payment-method">
                                <div className="c-Payment-method__Left">
                                    <h2>Payment Method</h2>
                                    <div className="c-Left__Info">
                                        {renderCardLogo("visa")}
                                        <p>●●●● 4242</p>
                                    </div>
                                </div>
                                <div className="c-Payment-method__Right">
                                    <button type="button" className="c-Btn c-Btn--stripe-purple-border">Change Card</button>
                                </div>

                            </div>
                        </div>


                        <h2>Billing History</h2>
                        <p>No Records Found!</p>
                    </div>
                </div>
            </PageLayout>
        </>
    )
}

export default Account;