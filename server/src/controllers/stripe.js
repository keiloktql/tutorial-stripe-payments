// Imports
const { createPaymentIntent, updatePaymentIntent, detachPaymentMethod, createSetupIntent, findPaymentMethodFromStripe, updateSubscriptionPaymentMethodInStripe } = require('../services/stripe');
const { findAccountByID, updateAccountByID, findAccountByStripeCustID } = require('../models/account');
const { findPaymentMethod, findDuplicatePaymentMethod, insertPaymentMethod, removePaymentMethod, updatePaymentMethod } = require('../models/paymentMethod');

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

            const updateAccountContent = {
                stripe_payment_intent_id: paymentIntentID,
                stripe_payment_intent_client_secret: clientSecret
            };
            // Update account with the new payment intent and client secret
            await updateAccountByID(accountID, updateAccountContent);
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

        // Check if user has active subscriptions
        // Active means subscription status aka stripe_status can be: 
        // 'incomplete', 'active', 'trialing'
        const activeSubscription = await findActiveSubscription(accountID);

        // If user already has active subscription, throw error
        if (activeSubscription) return res.status(400).json({
            message: "Account already has active subscription"
        });

        // Create subscription in Stripe
        const subscription = await createSubscriptionInStripe(account.stripe_customer_id, priceID, account.email);

        const subscriptionID = subscription.id;
        const planID = plan.plan_id;
        const paymentIntentID = subscription.latest_invoice.payment_intent.id;
        const clientSecret = subscription.latest_invoice.payment_intent.client_secret;

        // Create subscription in our database
        await createSubscription(subscriptionID, planID, accountID, paymentIntentID, clientSecret)

        return res.status(200).send({ clientSecret, subscriptionID });

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > stripe.js! > updateSubscription " + error);
    }
};

// Update Subscription
module.exports.updateSubscription = async (req, res) => {
    try {
        const { decoded } = res.locals.auth;
        const plan = res.locals.plan;
        const accountID = parseInt(decoded.account_id);
        const { paymentMethodID } = req.body;

        if (isNaN(accountID)) return res.status(400).json({
            message: "Invalid parameter \"accountID\""
        });

        // Get account information
        const account = await findAccountByID(accountID);
        if (!account) return res.status(404).json({
            message: "Cannot find \"account\""
        });

        // Check if user has active subscriptions
        // Active means subscription status aka stripe_status can be: 
        // 'incomplete', 'active', 'trialing'
        const activeSubscription = await findActiveSubscription(accountID);

        // If user don't have active subscription, throw error
        if (!activeSubscription) return res.status(404).json({
            message: "Cannot find subscription"
        });

        // Price ID of new plan
        const priceID = plan.stripe_price_id; // price ids are generated by stripe, every plan (product) has a price id associated to it
        const subscriptionID = activeSubscription.stripe_subscription_id;

        // Change plan
        if (plan) {
            // If subscription is in trial mode or incomplete, allow user to change plan immediately
            if (activeSubscription.stripe_status === "trialing" || activeSubscription.stripe_status === "incomplete") {
                // Update subscription plan in Stripe
                await updateSubscriptionPlanInStripe(subscriptionID, priceID);
            } else {
                // Update subscription schedule instead
            }
        }

        // Change default payment method
        if (paymentMethodID) {
            // Check if payment method exists in our database
            const paymentMethod = await findPaymentMethod(paymentMethodID);
            if (!paymentMethod) return res.status(404).json({
                message: "Cannot find parameter \"paymentMethod\""
            });

            // Update subscription payment method in Stripe
            await updateSubscriptionPaymentMethodInStripe(subscriptionID, paymentMethodID);

            // Update subscription payment method in our database
            await updateSubscriptionPaymentMethod(subscriptionID, paymentMethodID);
        }

        // // Update subscription in our database
        // const planID = plan.plan_id;
        // await updateSubscriptionPlan(subscriptionID, planID)

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

        // Check if user has active subscriptions
        // Active means subscription status aka stripe_status can be: 
        // 'incomplete', 'active', 'trialing'
        const activeSubscription = await findActiveSubscription(accountID);

        // If user don't have active subscription, throw error
        if (!activeSubscription) return res.status(404).json({
            message: "Cannot find subscription"
        });

        const subscriptionID = activeSubscription.stripe_subscription_id;

        // Cancel subscription in Stripe
        await cancelSubscription(subscriptionID);

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
                const paymentIntent = event.data.objects;

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
                // Update to billing

                // Update to subscription payment intent

                // Send email to user
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;

                // Check for subscription status: incomplete_expired

                // Update subscription in our database

                // Delete subscription in database if subscription status is 'incomplete_expired'

                // trialing
                break;
            }

            case 'invoice.payment_failed': {
                // If the payment fails or the customer does not have a valid payment method,
                // an invoice.payment_failed event is sent, the subscription becomes past_due.
                // Use this webhook to notify user that their payment has
                // failed and to retrieve new card details.

                // Send email to customer informing them to take action

                break;
            }

            case 'invoice.payment_action_required': {
                // If the payment fails due to card authentication required,
                // an invoice.payment_failed event is sent, the subscription becomes past_due.
                // Use this webhook to notify user that their payment has
                // failed and to retrieve new card details.

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