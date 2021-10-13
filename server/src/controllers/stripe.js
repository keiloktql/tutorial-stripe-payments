const dayjs = require('dayjs');

// Imports
const { createPaymentIntent, updatePaymentIntent, detachPaymentMethod, createSetupIntent, findPaymentMethodFromStripe, updateSubscriptionInStripe, findPaymentIntent, createSubscriptionInStripe } = require('../services/stripe');
const { findAccountByID, updateAccountByID, findAccountByStripeCustID } = require('../models/account');
const { findPaymentMethod, findDuplicatePaymentMethod, insertPaymentMethod, removePaymentMethod, updatePaymentMethod } = require('../models/paymentMethod');
const { deleteSubscription, updateSubscription, createSubscription, findLiveSubscription, findActiveSubscription } = require('../models/subscription');
const { findPlanByPriceID } = require('../models/plan');
const { findInvoice, createInvoice } = require('../models/invoice');

// Create payment intent
module.exports.createPaymentIntent = async (req, res) => {
    try {

        const { decoded } = res.locals.auth;
        const accountID = parseInt(decoded.account_id);

        if (isNaN(accountID)) return res.status(400).json({
            message: "Invalid parameter \"accountID\""
        });

        const account = await findAccountByID(accountID);

        if (!account) return res.status(400).json({
            message: "Cannot find \"account\""
        });

        const { totalPrice } = res.locals;

        let clientSecret;
        let paymentIntentID;

        // Check if user already has a payment intent
        if (account.stripe_payment_intent_id === null) {
            const paymentIntent = await createPaymentIntent(totalPrice, account.stripe_customer_id, account.email);

            clientSecret = paymentIntent.client_secret;
            paymentIntentID = paymentIntent.id;

            const meta = {
                stripe_payment_intent_id: paymentIntentID,
                stripe_payment_intent_client_secret: clientSecret
            };
            // Update account with the new payment intent and client secret
            await updateAccountByID(accountID, meta);
        } else {
            clientSecret = account.stripe_payment_intent_client_secret;
            paymentIntentID = account.stripe_payment_intent_id;
        }

        return res.status(200).send({ clientSecret, paymentIntentID });

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > stripe.js > createPaymentIntent! " + error);
    }
};

// Update payment intent
module.exports.updatePaymentIntent = async (req, res) => {
    try {
        const { paymentIntentID } = req.body;
        if (!paymentIntentID) return res.status(400).json({
            message: "Cannot find parameter \"paymentIntentID\""
        });
        const { totalPrice } = res.locals;

        await updatePaymentIntent(paymentIntentID, totalPrice);

        return res.status(204).send();

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > stripe.js > updatePaymentIntent! " + error);
    }
};

// Create setup intent
module.exports.createSetupIntent = async (req, res) => {
    try {
        const { decoded } = res.locals.auth;
        const accountID = parseInt(decoded.account_id);

        if (isNaN(accountID)) return res.status(400).json({
            message: "Invalid parameter \"accountID\""
        });

        const account = await findAccountByID(accountID);

        if (!account) return res.status(400).json({
            message: "Cannot find \"account\""
        });

        const setupIntent = await createSetupIntent(account.stripe_customer_id);
        const clientSecret = setupIntent.client_secret;
        const setupIntentID = setupIntent.id;

        return res.status(200).send({ clientSecret, setupIntentID });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > stripe.js! > createSetupIntent " + error);
    }
};

// Create payment method
module.exports.createPaymentMethod = async (req, res) => {
    try {
        const { decoded } = res.locals.auth;
        const accountID = parseInt(decoded.account_id);

        if (isNaN(accountID)) return res.status(400).json({
            message: "Invalid parameter \"accountID\""
        });

        const { paymentMethodID } = req.body;

        if (!paymentMethodID) return res.status(400).json({
            message: "Cannot find parameter \"paymentMethodID\""
        });

        // Obtain more details about payment method from Stripe
        const paymentMethod = await findPaymentMethodFromStripe(paymentMethodID);

        if (!paymentMethod) return res.status(400).json({
            message: "Cannot find \"paymentMethod\""
        });

        // Every card has a unique fingerprint
        const cardFingerprint = paymentMethod.card.fingerprint;

        // Check if new payment method already exists in our database
        const duplicatedPaymentMethod = await findDuplicatePaymentMethod(accountID, cardFingerprint, paymentMethodID);

        if (duplicatedPaymentMethod) {
            await detachPaymentMethod(paymentMethodID); // Detach payment method from Stripe database

            return res.status(400).json({
                duplicate: true,
                message: "Payment Method already exists"
            });
        }


        const cardLastFourDigit = paymentMethod.card.last4;
        const cardType = paymentMethod.card.brand;
        const cardExpMonth = paymentMethod.card.exp_month.toString();
        const cardExpYear = paymentMethod.card.exp_year.toString();
        const cardExpDate = cardExpMonth + "/" + cardExpYear.charAt(2) + cardExpYear.charAt(3);
        console.log(
            `
            ---------------
            cardType: ${cardType}
            cardLastFourDigit: ${cardLastFourDigit}
            cardFingerprint: ${cardFingerprint}
            ---------------
            `
        )
        // Insert payment method in our database
        await insertPaymentMethod(accountID, paymentMethodID, cardFingerprint, cardLastFourDigit, cardType, cardExpDate);

        return res.status(200).send({ duplicate: false });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > stripe.js! > createPaymentMethod " + error);
    }
};

// Remove payment method
module.exports.removePaymentMethod = async (req, res) => {
    try {
        const { decoded } = res.locals.auth;
        const accountID = parseInt(decoded.account_id);

        if (isNaN(accountID)) return res.status(400).json({
            message: "Invalid parameter \"accountID\""
        });

        const { paymentMethodID } = req.body;

        if (!paymentMethodID) return res.status(404).json({
            message: "Cannot find parameter \"paymentMethodID\""
        });

        // Find payment method in our database
        const paymentMethod = await findPaymentMethod(paymentMethodID);

        if (!paymentMethod) return res.status(404).json({
            message: "Cannot find \"paymentMethod\""
        });

        // Remove payment method
        await detachPaymentMethod(paymentMethodID); // Stripe

        await removePaymentMethod(paymentMethodID); // Our database shd be shifte=d to webhook

        return res.status(200).send();

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > stripe.js! > removePaymentMethod " + error);
    }
};

// Create Subscription
module.exports.createSubscription = async (req, res) => {
    try {

        const { decoded } = res.locals.auth;
        const plan = res.locals.plan;
        const { paymentMethodID } = req.body;
        const accountID = parseInt(decoded.account_id);
        const { type } = req.params;

        if (!type) return res.status(400).json({
            message: "Invalid parameter \"type\""
        });

        if (isNaN(accountID)) return res.status(400).json({
            message: "Invalid parameter \"accountID\""
        });

        // Get account information
        const account = await findAccountByID(accountID);
        if (!account) return res.status(404).json({
            message: "Cannot find \"account\""
        });

        const priceID = plan.stripe_price_id; // price ids are generated by stripe, every plan (product) has a price id associated to it

        // Check if user has live subscriptions
        // live means subscription status aka stripe_status can be: 
        // 'incomplete', 'active', 'trialing', 'past_due'
        const liveSubscription = await findLiveSubscription(accountID);

        // If user already has live subscription, throw error
        if (liveSubscription) return res.status(400).json({
            message: "Account already has a live subscription"
        });

        let subscriptionID;
        let clientSecret;

        // If account has not used its free trial yet
        if (!account.trialed) {

            if (!paymentMethodID) return res.status(400).json({
                message: "Invalid parameter \"paymentMethodID\""
            });

            // Check if payment method exists
            const paymentMethod = findPaymentMethod(paymentMethodID);
            if (!paymentMethod) return res.status(404).json({
                message: "Cannot find payment method!"
            });

            // Unix time now + 7 days
            const trialEndDate = Math.floor(Date.now() / 1000) + 604800;
            const tempTrialEndDate = Math.floor(Date.now() / 1000) + 180; // for testing, trial lasts for 3 mins

            // Create subscription in Stripe
            const subscription = await createSubscriptionInStripe(account.stripe_customer_id, priceID, account.email, {
                trial_end: tempTrialEndDate,
                default_payment_method: paymentMethodID
            });

            const subscriptionID = subscription.id;
            const planID = plan.plan_id;

            // Create subscription in our Database
            await createSubscription(subscriptionID, planID, accountID, 'trialing', {
                trial_end: dayjs(tempTrialEndDate).toDate(),
                fk_payment_method: paymentMethodID
            });

            // Update user trialed status to prevent user from access to free trial multiple times
            await updateAccountByID(accountID, {
                trialed: true
            });
        } else {
            // Create subscription in Stripe
            const subscription = await createSubscriptionInStripe(account.stripe_customer_id, priceID, account.email);
            const subscriptionID = subscription.id;
            const planID = plan.plan_id;
            const paymentIntentID = subscription.latest_invoice.payment_intent.id;
            const clientSecret = subscription.latest_invoice.payment_intent.client_secret;
            // Create subscription in our database
            await createSubscription(subscriptionID, planID, accountID, 'incomplete');

            // Insert incomplete invoice
            await createInvoice({
                stripe_invoice_id: subscription.latest_invoice.id,
                stripe_payment_intent_id: paymentIntentID,
                stripe_client_secret: clientSecret,
                stripe_payment_intent_status: 'incomplete',
                amount,
                fk_stripe_subscription_id: subscriptionID,
            });
        }

        return res.status(200).send({ clientSecret, subscriptionID });

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > stripe.js! > createSubscription " + error);
    }
};

// Update Subscription
module.exports.updateSubscription = async (req, res) => {
    try {
        const { decoded } = res.locals.auth;
        const plan = res.locals.plan;
        const accountID = parseInt(decoded.account_id);
        const { paymentMethodID, billingEmail } = req.body;

        if (isNaN(accountID)) return res.status(400).json({
            message: "Invalid parameter \"accountID\""
        });

        // Get account information
        const account = await findAccountByID(accountID);
        if (!account) return res.status(404).json({
            message: "Cannot find \"account\""
        });

        // Check if user has active subscriptions
        // Live means subscription status aka stripe_status can be: 
        // 'incomplete', 'active', 'trialing' or 'past_due'
        const liveSubscription = await findLiveSubscription(accountID);

        // If user don't have live subscription, throw error
        if (!liveSubscription) return res.status(404).json({
            message: "Cannot find subscription"
        });

        // Price ID of new plan
        const priceID = plan.stripe_price_id; // price ids are generated by stripe, every plan (product) has a price id associated to it
        const subscriptionID = liveSubscription.stripe_subscription_id;

        // Change plan
        if (plan) {
            // Prevent changing of same plan
            if (plan.plan_id === liveSubscription.plan.plan_id) return res.status(400).json({
                message: "Same plan change not allowed!"
            });

            await updateSubscriptionInStripe(subscriptionID, {
                items: [{
                    price: priceID
                }]
            });

            // Update subscription in our database
            const planID = plan.plan_id;
            await updateSubscription(subscriptionID, { fk_plan_id: planID })
        }

        // Change default payment method
        if (paymentMethodID) {
            // Check if payment method exists in our database
            const paymentMethod = await findPaymentMethod(paymentMethodID);
            if (!paymentMethod) return res.status(404).json({
                message: "Cannot find parameter \"paymentMethod\""
            });

            // Update subscription payment method in Stripe
            await updateSubscriptionInStripe(subscriptionID, { default_payment_method: paymentMethodID });

            // Update subscription payment method in our database
            await updateSubscription(subscriptionID, { fk_payment_method: paymentMethodID });
        }

        // Change billing email
        // Invoice will be sent to this email instead
        if (billingEmail) {
            // Update billing email in Stripe
            await updateSubscriptionInStripe(subscriptionID, { reciept_email: billingEmail })

            // Update billing email in our Database
            await updateSubscription(subscriptionID, { billing_email: billingEmail });
        }

        return res.status(200).send();

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > stripe.js! > updateSubscriptionPlan " + error);
    }
};

// Cancel Subscription
module.exports.cancelSubscription = async (req, res) => {
    try {
        const { decoded } = res.locals.auth;
        const accountID = parseInt(decoded.account_id);

        if (isNaN(accountID)) return res.status(400).json({
            message: "Invalid parameter \"accountID\""
        });

        // Check if user has live subscriptions
        // live means subscription status aka stripe_status can be: 
        // 'incomplete', 'active', 'trialing', 'past_due'
        const liveSubscription = await findLiveSubscription(accountID);

        // If user don't have live subscription, throw error
        if (!liveSubscription) return res.status(404).json({
            message: "Cannot find live subscriptions"
        });

        const subscriptionID = liveSubscription.stripe_subscription_id;

        // Cancel subscription in Stripe
        await cancelSubscription(subscriptionID);

        // Update subscription status in our Database
        await updateSubscription(subscriptionID, {
            stripe_status: "canceling"
        });

        return res.status(200).send();

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > stripe.js! > cancelSubscription " + error);
    }
};

// Webhooks
module.exports.handleWebhook = async (req, res) => {
    try {
        const event = req.body;

        // Types of events: https://stripe.com/docs/api/events/types
        switch (event.type) {

            // This case is only applicable for one time payment
            case 'payment_intent.succeeded': {
                // event.data.object returns payment intent
                const paymentIntent = event.data.object;

                const stripeCustomerID = paymentIntent.customer;
                const account = await findAccountByStripeCustID(stripeCustomerID);

                // Check if payment intent belongs to one-time payment's paymemt intent
                if (paymentIntent.id === account.stripe_payment_intent_id) {
                    const accountID = account.account_id;

                    // Remove customer payment intent and client secret
                    await updateAccountByID(accountID, {
                        stripe_payment_intent_client_secret: null,
                        stripe_payment_intent_id: null
                    });
                }
                break;
            }

            case 'payment_method.automatically_updated': {
                // Purpose of listening to this event: https://stripe.com/docs/saving-cards#automatic-card-updates
                const paymentMethod = event.data.object;

                const cardFingerprint = paymentMethod.card.fingerprint;
                const cardLastFourDigit = paymentMethod.card.last4;
                const cardType = paymentMethod.card.brand;
                const cardExpMonth = paymentMethod.card.exp_month.toString();
                const cardExpYear = paymentMethod.card.exp_year.toString();
                const cardExpDate = cardExpMonth + "/" + cardExpYear.charAt(2) + cardExpYear.charAt(3);
                const paymentMethodID = paymentMethod.id;

                // Update payment method
                await updatePaymentMethod(paymentMethodID, cardFingerprint, cardLastFourDigit, cardType, cardExpDate);
                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object;
                const subscriptionID = invoice.subscription;
                const paymentIntentID = invoice.payment_intent;

                const paymentIntent = await findPaymentIntent(paymentIntentID);
                const paymentMethod = paymentIntent.payment_method;
                const paymentMethodID = paymentMethod.id;

                // https://stripe.com/docs/api/invoices/object#invoice_object-billing_reason
                if (invoice.billing_reason === 'subscription_create') {
                    console.log(
                        `
                        ---------------------
                        ran subscription create webhook function
                        ----------------------
                        `
                    );
                    // Update subscription payment method in Stripe
                    await updateSubscriptionInStripe(subscriptionID, { default_payment_method: paymentMethodID });

                    // Update subscription payment method in our database
                    await updateSubscription(subscriptionID, { fk_payment_method: paymentMethodID });
                }

                // Find plan based on price id
                const priceID = invoice.lines.data[0].price.id;
                const plan = await findPlanByPriceID(priceID);
                const amount = plan.price; // price of subscription plan

                // billing cycle
                const currentPeriodStart = dayjs(invoice.period_start).toDate();
                const currentPeriodEnd = dayjs(invoice.period_end).toDate();

                // Payment method information
                const cardFingerprint = paymentMethod.card.fingerprint;
                const cardLastFourDigit = paymentMethod.card.last4;
                const cardType = paymentMethod.card.brand;
                const cardExpMonth = paymentMethod.card.exp_month.toString();
                const cardExpYear = paymentMethod.card.exp_year.toString();
                const cardExpDate = cardExpMonth + "/" + cardExpYear.charAt(2) + cardExpYear.charAt(3);

                // Check if invoice exists in our Database already
                const invoiceExists = findInvoice(invoice.id);
                if (invoiceExists) {
                    // Update invoice
                    await updateInvoice(invoice.id, {
                        stripe_payment_intent_status: 'succeeded',
                        amount,
                        fk_stripe_subscription_id: subscriptionID,
                        stripe_period_start: currentPeriodStart,
                        stripe_period_end: currentPeriodEnd,
                        stripe_payment_method_fingerprint: cardFingerprint,
                        stripe_card_exp_date: cardExpDate,
                        stripe_card_last_four_digit: cardLastFourDigit,
                        stripe_card_type: cardType
                    });
                } else {
                    const clientSecret = paymentIntent.client_secret;

                    // Insert invoice
                    await createInvoice({
                        stripe_invoice_id: invoice.id,
                        stripe_payment_intent_id: paymentIntentID,
                        stripe_client_secret: clientSecret,
                        stripe_payment_intent_status: 'succeeded',
                        amount,
                        fk_stripe_subscription_id: subscriptionID,
                        stripe_period_start: currentPeriodStart,
                        stripe_period_end: currentPeriodEnd,
                        stripe_payment_method_fingerprint: cardFingerprint,
                        stripe_card_exp_date: cardExpDate,
                        stripe_card_last_four_digit: cardLastFourDigit,
                        stripe_card_type: cardType
                    });
                }

                // Send email to user
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const subscriptionID = subscription.id;
                const subscriptionStatus = subscription.status;

                if (subscriptionStatus === "incomplete_expired") {
                    // Delete subscription in database if subscription status is 'incomplete_expired'
                    deleteSubscription(subscriptionID);
                } else {
                    const priceID = invoice.lines.data[0].price.id;
                    const plan = await findPlanByPriceID(priceID);

                    // Only applicable for canceled subscription
                    if (subscriptionStatus === "canceled") {
                        const latestInvoiceID = subscription.latest_invoice;
                        const invoice = await findInvoiceInStripe(latestInvoiceID);

                        // Only applicable for cancellations due to overdue payments
                        if (invoice.status !== 'paid') {
                            const amount = plan.price; // price of subscription plan
                            const currentPeriodStart = dayjs(invoice.period_start).toDate();
                            const currentPeriodEnd = dayjs(invoice.period_end).toDate();

                            const invoiceExists = await findInvoice(latestInvoiceID);
                            if (invoiceExists) {
                                // Update invoice
                                await updateInvoice(latestInvoiceID, {
                                    stripe_payment_intent_status: 'canceled',
                                    amount,
                                    fk_stripe_subscription_id: subscriptionID,
                                    stripe_period_start: currentPeriodStart,
                                    stripe_period_end: currentPeriodEnd
                                });
                            } else {
                                // Insert invoice
                                await createInvoice({
                                    stripe_invoice_id: latestInvoiceID,
                                    stripe_payment_intent_status: 'canceled',
                                    amount,
                                    fk_stripe_subscription_id: subscriptionID,
                                    stripe_period_start: currentPeriodStart,
                                    stripe_period_end: currentPeriodEnd
                                });
                            }
                        }
                    }

                    const planID = plan.plan_id;
                    // New billing cycle date
                    const subscriptionPeriodStart = dayjs(subscription.current_period_start).toDate(); // dayjs function converts unix time to native Date Object
                    const subscriptionPeriodEnd = dayjs(subscription.current_period_end).toDate();

                    // Update plan, subscription status, and new billing cycle in our Database
                    updateSubscription(subscriptionID, {
                        stripe_status: subscriptionStatus,
                        fk_plan_id: planID,
                        // New billing cycle
                        current_period_start: subscriptionPeriodStart,
                        current_period_end: subscriptionPeriodEnd
                    });
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const subscriptionID = invoice.subscription;
                // If the payment fails or the customer does not have a valid payment method,
                // an invoice.payment_failed event is sent, the subscription becomes past_due.
                // Use this webhook to notify user that their payment has
                // failed and to retrieve new card details.

                // Find plan based on price id
                const priceID = invoice.lines.data[0].price.id;
                const plan = await findPlanByPriceID(priceID);
                const amount = plan.price; // price of subscription plan
                const currentPeriodStart = dayjs(invoice.period_start).toDate();
                const currentPeriodEnd = dayjs(invoice.period_end).toDate();

                // Check if invoice exists in our Database already
                const invoiceExists = findInvoice(invoice.id);
                if (invoiceExists) {
                    // Update invoice
                    await updateInvoice(invoice.id, {
                        stripe_payment_intent_status: 'requires_payment_method',
                        amount,
                        fk_stripe_subscription_id: subscriptionID,
                        stripe_period_start: currentPeriodStart,
                        stripe_period_end: currentPeriodEnd
                    });
                } else {
                    const paymentIntentID = invoice.payment_intent;
                    const paymentIntent = await findPaymentIntent(paymentIntentID);
                    const clientSecret = paymentIntent.client_secret;

                    // Insert invoice
                    await createInvoice({
                        stripe_invoice_id: invoice.id,
                        stripe_payment_intent_id: paymentIntentID,
                        stripe_client_secret: clientSecret,
                        stripe_payment_intent_status: 'requires_payment_method',
                        amount,
                        fk_stripe_subscription_id: subscriptionID,
                        stripe_period_start: currentPeriodStart,
                        stripe_period_end: currentPeriodEnd
                    });
                }

                // Send email to customer informing them to take action

                break;
            }

            case 'invoice.payment_action_required': {
                const invoice = event.data.object;
                const subscriptionID = invoice.subscription;
                // If the payment fails due to card authentication required,
                // an invoice.payment_failed event is sent, the subscription becomes past_due.
                // Use this webhook to notify user that their payment has
                // failed and to retrieve new card details.

                // Find plan based on price id
                const priceID = invoice.lines.data[0].price.id;
                const plan = await findPlanByPriceID(priceID);
                const amount = plan.price; // price of subscription plan
                const currentPeriodStart = dayjs(invoice.period_start).toDate();
                const currentPeriodEnd = dayjs(invoice.period_end).toDate();

                // Check if invoice exists in our Database already
                const invoiceExists = findInvoice(invoice.id);
                if (invoiceExists) {
                    // Update invoice
                    await updateInvoice(invoice.id, {
                        stripe_payment_intent_status: 'requires_action',
                        amount,
                        fk_stripe_subscription_id: subscriptionID,
                        stripe_period_start: currentPeriodStart,
                        stripe_period_end: currentPeriodEnd
                    });
                } else {
                    const paymentIntentID = invoice.payment_intent;
                    const paymentIntent = await findPaymentIntent(paymentIntentID);
                    const clientSecret = paymentIntent.client_secret;

                    // Insert invoice
                    await createInvoice({
                        stripe_invoice_id: invoice.id,
                        stripe_payment_intent_id: paymentIntentID,
                        stripe_client_secret: clientSecret,
                        stripe_payment_intent_status: 'requires_action',
                        amount,
                        fk_stripe_subscription_id: subscriptionID,
                        stripe_period_start: currentPeriodStart,
                        stripe_period_end: currentPeriodEnd
                    });
                }

                // Send email to customer informing them to take action

                break;
            }

            // Unexpected event type
            default: {
                console.log(`Unhandled event type ${event.type}.`);
            }
        };

        return res.status(200).send();

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > stripe.js > handleWebhook! " + error);
    }
}