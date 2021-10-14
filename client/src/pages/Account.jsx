import React, { useState, useEffect } from 'react';
import config from '../config/config';
import { toast } from 'react-toastify';
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
import SelectPaymentMethod from '../common/SelectPaymentMethod';
import { confirmAlert } from 'react-confirm-alert';
import CustomConfirmAlert from '../common/CustomConfirmAlert';

const Account = () => {
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
    const [subscriptionInfo, setSubscriptionInfo] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [showSetupPaymentMethod, setShowSetupPaymentMethod] = useState(false);
    const [showChangeCard, setShowChangeCard] = useState(false);
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

                const activeSubscriptionResponse = await axios.get(`${config.baseUrl}/subscription/active`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const accountData = accountResponse.data;
                const activeSubscriptionData = activeSubscriptionResponse.data;

                if (componentMounted) {

                    if (accountData.account) {
                        setProfileData(() => ({
                            email: accountData.account.email,
                            username: accountData.account.username
                        }));
                        setPaymentMethods(() => accountData.account.payment_accounts.map((paymentAccount, index) => ({
                            serialNo: index + 1,
                            cardType: paymentAccount.stripe_card_type,
                            last4: paymentAccount.stripe_card_last_four_digit,
                            expDate: paymentAccount.stripe_card_exp_date,
                            stripePaymentMethodID: paymentAccount.stripe_payment_method_id,
                            createdAt: dayjs(new Date(paymentAccount.created_at)).format("MMMM D, YYYY h:mm A"),
                        })));
                    }

                    if (activeSubscriptionData.activeSubscription) {
                        const activeSubscription = activeSubscriptionData.activeSubscription;

                        if (activeSubscription.invoice) {
                            // Set Billing history
                            setBillingHistory(() => activeSubscription.invoice.map((invoice, index) => ({
                                invoiceID: invoice.stripe_invoice_id,
                                invoiceReferenceNumber: invoice.stripe_reference_number,
                                amount: invoice.amount,
                                status: (() => {
                                    const status = invoice.stripe_payment_intent_status;
                                    if (status === "succeeded") {
                                        return "Paid";
                                    } else if (status === "requires_action") {
                                        return "Requires Action";
                                    } else if (status === "requires_payment_method") {
                                        return "Failed";
                                    } else if (status === "canceled") {
                                        return "Canceled";
                                    } else {
                                        return status;
                                    }
                                })(),
                                cardType: invoice.stripe_card_type,
                                last4: invoice.stripe_card_last_four_digit,
                                // todo: Paid at?
                                action: (() => {
                                    if (invoice.stripe_payment_intent_status !== "succeeded" && invoice.stripe_payment_intent_status !== "canceled") {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                })()
                            })))
                        }

                        // Subscription info
                        setSubscriptionInfo(() => ({
                            status: activeSubscription.stripe_status,
                            plan: activeSubscription.plan.name,
                            price: activeSubscription.plan.price,
                            billingCycle: (() => {
                                if (activeSubscription.stripe_status !== "trialing") {
                                    return dayjs(new Date(activeSubscription.current_period_start)).format("MMMM D, YYYY") + " - " + dayjs(new Date(activeSubscription.current_period_end)).format("MMMM D, YYYY")
                                } else {
                                    return null;
                                }
                            })(),
                            trialEnd: (() => {
                                if (activeSubscription.stripe_status === "trialing") {
                                    return dayjs(new Date(activeSubscription.trial_end)).format("MMMM D, YYYY h:mm A")
                                } else {
                                    return null;
                                }
                            })(),
                            last4: "●●●● " + activeSubscription.payment_method.stripe_card_last_four_digit,
                            cardType: activeSubscription.payment_method.stripe_card_type,
                        }))

                        // Set default payment method
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

    const billingHistoryColumn = [
        {
            dataField: 'invoiceReferenceNumber',
            text: 'Reference Number',
        },
        {
            dataField: 'amount',
            text: 'Amount',
            formatter: (cell, row) => {
                if (cell) {
                    return <p>S${cell}</p>
                } else {
                    return null;
                }
            }
        },
        {
            dataField: 'status',
            text: 'Status',
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
            dataField: 'last4',
            text: 'Last 4 Digit',
            formatter: (cell) => (
                "●●●● " + cell
            )
        },
        {
            dataField: 'createdAt',
            text: 'Paid on'
        },
        {
            dataField: 'action',
            text: '',
            formatter: (cell, row) => {
                if (cell) {
                    return <button type="button" className = "c-Btn c-Btn--empty">Pay Now</button>
                } else {
                    return null;
                }
            }
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
            dataField: 'last4',
            text: 'Last 4 Digit',
            formatter: (cell) => (
                "●●●● " + cell
            )
        },
        {
            dataField: 'expDate',
            text: 'Valid Thru',
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

    // When user select payment method to change default payment method
    const handleSelectPaymentMethod = (stripePaymentMethodID) => {
        if (stripePaymentMethodID === selectedPaymentMethod) {
            setSelectedPaymentMethod(() => null);
        } else {
            setSelectedPaymentMethod(() => stripePaymentMethodID);
        }
    };

    // For payment methods section only
    const handleRemoveCard = (paymentMethodID) => {
        // Show confirmation modal
        confirmAlert({
            customUI: ({ onClose }) => {
                return <CustomConfirmAlert
                    message="Are you sure you want to remove this card?"
                    onClose={onClose}
                    handler={(onClose) => executeRemoveCard(onClose)}
                    heading="Confirm Remove Card?"
                />
            }
        });

        const executeRemoveCard = (onClose) => {

        }
    };

    // Subscription handlers

    const handleCancelSubscription = () => {
        let message = "Click confirm to proceed.";
        if (subscriptionInfo?.trialEnd) {
            // if subscription is in free trial
            message = "Free trial will be counted as used."
        }
        // Show confirmation modal
        confirmAlert({
            customUI: ({ onClose }) => {
                return <CustomConfirmAlert
                    message={message}
                    onClose={onClose}
                    handler={(onClose) => performCancelSubscription(onClose)}
                    heading="Confirm Cancel Subscription?"
                />
            }
        });

        // Call endpoint to cancel subscription
        const performCancelSubscription = async (onClose) => {
            try {
                await axios.delete(`${config.baseUrl}/stripe/subscriptions`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                onClose();
                toast.success("Successfully cancelled subscription!");
            } catch (error) {
                console.log(error);
                let errCode = "Error!";
                let errMsg = "Error!";
                if (error.response !== undefined) {
                    errCode = error.response.status;
                    errMsg = error.response.data.message;
                }
                toast.error(
                    <>
                        Error Code: <b>{errCode}</b>
                        <br />
                        Message: <b>{errMsg}</b>
                    </>
                );
                onClose();
            }
        };
    };

    const handleChangeSubscriptionPaymentMethod = () => {

    };

    const handleShowChangeCard = () => {
        setSelectedPaymentMethod(() => null);
        setShowChangeCard((prevState) => !prevState);
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
                        {
                            subscriptionInfo ?
                                <>
                                    <div className="l-Subscription__Info">
                                        {
                                            subscriptionInfo?.trialEnd ?
                                                null :
                                                <h2>Current Billing Cycle: {subscriptionInfo?.billingCycle}</h2>
                                        }
                                        {
                                            subscriptionInfo?.status === "canceling" ?
                                            <p>Subscription is canceling at the end of the billing cycle.</p> :
                                            null
                                        }

                                        <div className="c-Subscription__Info c-Info">
                                            <div className="c-Info__Card">
                                                <h2>Current Plan</h2>
                                                <h3>{subscriptionInfo?.plan}</h3>
                                                <p>S${subscriptionInfo?.price} per month</p>
                                                {
                                                    subscriptionInfo?.trialEnd ?
                                                        <>
                                                            <Chip className="c-Info__Card-chip" label="Trialing" color="primary" />
                                                            <p>Trial ends on {subscriptionInfo?.trialEnd}</p>
                                                        </>
                                                        :
                                                        <Chip className="c-Info__Card-chip" label="Active" color="success" />
                                                }
                                            </div>
                                            <div className="c-Info__Btns">
                                                <NavLink to="/plans/change" className="c-Btn c-Btn--stripe-purple">Change Plan</NavLink>
                                                <button type="button" onClick={handleCancelSubscription} className="c-Btn c-Btn--stripe-purple-border">Cancel Subscription</button>
                                            </div>
                                        </div>
                                    </div><div className="l-Subscription__Payment-method">
                                        <div className="c-Subscription__Payment-method c-Payment-method">
                                            <h2>Payment Method</h2>
                                            <hr />
                                            <div className="c-Payment-method__Top">
                                                <div className="c-Payment-method__Left">
                                                    <div className="c-Left__Info">
                                                        {renderCardLogo(subscriptionInfo?.cardType)}
                                                        <p>●●●● {subscriptionInfo?.last4}</p>
                                                    </div>
                                                </div>
                                                <div className="c-Payment-method__Right">
                                                    {showChangeCard ?
                                                        null :
                                                        <button type="button" className="c-Btn c-Btn--stripe-purple-border" onClick={handleShowChangeCard}>Change Card</button>}
                                                </div>
                                            </div>
                                            {showChangeCard ?
                                                <>
                                                    <hr />
                                                    <div className="c-Payment-method__Change c-Change">
                                                        <h1>Change Payment Method</h1>
                                                        {paymentMethods.length > 0 ?
                                                            paymentMethods.map((paymentMethod, index) => (
                                                                <div className="c-Change__Payment-methods" key={index}>
                                                                    <SelectPaymentMethod
                                                                        index={index}
                                                                        cardBrand={paymentMethod.cardType}
                                                                        last4={paymentMethod.last4}
                                                                        expDate={paymentMethod.expDate}
                                                                        stripePaymentMethodID={paymentMethod.stripePaymentMethodID}
                                                                        selectedPaymentMethod={selectedPaymentMethod}
                                                                        handleSelectPaymentMethod={handleSelectPaymentMethod} />
                                                                </div>
                                                            ))
                                                            :
                                                            <p>No payment methods found.</p>}
                                                        <div className="c-Change__Btns">
                                                            <button type="button" className="c-Btn c-Btn--stripe-purple">Save</button>
                                                            <button type="button" className="c-Btn c-Btn--empty" onClick={handleShowChangeCard}>Cancel</button>
                                                        </div>
                                                    </div>
                                                </>
                                                :
                                                null}
                                        </div>
                                    </div></>
                                :
                                <div className="l-Subscription__No-subscription c-No-subscription">
                                    <p>No Subscription Plan.</p>
                                </div>
                        }

                        <div className="c-Subscription__Billing-history c-Billing-history">
                            <h2>Billing History</h2>
                            <hr />
                            {
                                billingHistory.length === 0 ?
                                    <p>No Billing History Found!</p>
                                    :
                                    <>
                                        {/* Billing history table */}

                                        <div className="c-Billing-history__Table">
                                            <BootstrapTable
                                                bordered={false}
                                                keyField="serialNo"
                                                data={billingHistory}
                                                columns={billingHistoryColumn}
                                            />
                                        </div>
                                    </>
                            }
                        </div>

                    </div>
                </div>
            </PageLayout>
        </>
    )
}

export default Account;