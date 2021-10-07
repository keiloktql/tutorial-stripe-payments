const { createPaymentIntent, updatePaymentIntent } = require('../services/stripe');
const { findAccountByID, updateAccountByID } = require('../models/account');

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

// Webhooks
module.exports.handleWebhook = async (req, res) => {
    try {
        const event = req.body;
        // Types of events: https://stripe.com/docs/api/events/types

        switch (event.type) {
            case 'payment_intent.succeeded': {
                // event.data.object returns payment intent
                const paymentIntent = event.data.object;

                // Find out account id from stripe customer id
                const stripeCustomerID = paymentIntent.customer;

                const account = await findAccountByStripeCustID(stripeCustomerID);

                // Verify that payment intent to be deleted matches the payment intent sent by Stripe
                // as payment_intent.succeeded can be due to billing of subscription plan
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
        };

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > stripe.js > handleWebhook! " + error);
    }
}