const bcrypt = require("bcryptjs");

const { findAccountByID, createAccount, updateAccountByID } = require('../models/account');
const { findActiveSubscription } = require("../models/subscription");
const { createStripeCustomer, updateStripeCustomer } = require('../services/stripe');

// Get account by ID

module.exports.findAccountByID = async (req, res) => {
    try {

        const accountID = parseInt(req.params.accountID);
        if (isNaN(accountID)) return res.status(400).json({
            message: "Invalid parameter \"accountID\""
        });

        const account = await findAccountByID(accountID);
        if (!account) return res.status(404).json({
            message: `\"accountID\" ${accountID} not found`
        });

        const activeSubscription = await findActiveSubscription(accountID);

        return res.status(200).send({
            account,
            activeSubscription
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > account.js > findAccountByID ! " + error);
    }
}

// Create account
module.exports.createAccount = async (req, res) => {
    try {
        const {email, username, password} = req.body;

        // Didn't do output sanitization, validation checks

        // Didn't checked whether email and username already exists

        if (!email || !username || !password) return res.status(400).json({
            message: `Missing fields`
        });

        // Create account in stripe
        const customer = await createStripeCustomer(email, username);
        const stripeCustomerID = customer.id;

        // Create account in our database
        await createAccount(username, email, bcrypt.hashSync(password, 10), stripeCustomerID);

        return res.status(200).send();

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > account.js > createAccount ! " + error);
    }
};

// Edit account
module.exports.editAccount = async (req, res) => {
    try {
        const {email, username, password} = req.body;
        
        const { decoded } = res.locals.auth;
        const accountID = parseInt(decoded.account_id);

        if (isNaN(accountID)) return res.status(400).json({
            message: "Invalid parameter \"accountID\""
        });

        if (!email && !username && !password) return res.status(400).json({
            message: `Missing fields`
        });

        // Get account information
        const account = await findAccountByID(accountID);
        if (!account) return res.status(404).json({
            message: `\"accountID\" ${accountID} not found`
        });

        const stripeCustomerID = account.stripe_customer_id;

        if (email) {
            // Update email in Stripe
            await updateStripeCustomer(stripeCustomerID, { email });

            // Update email in our Database
            await updateAccountByID(accountID, { email });
        }

        if (username) {
            // Update username in Stripe
            await updateStripeCustomer(stripeCustomerID, { name: username });

             // Update username in our Database
            await updateAccountByID(accountID, { username });
        }

        if (password) {
            // Update password in our Database
            await updateAccountByID(accountID, {
                password: bcrypt.hashSync(password, 10)
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > account.js > editAccount ! " + error);
    }
}