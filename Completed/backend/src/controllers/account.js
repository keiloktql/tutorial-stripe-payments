const { findAccountByID, createAccount } = require('../models/account');
const { createStripeCustomer } = require('../services/stripe');

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

        return res.status(200).send({
            account
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > account.js! " + error);
    }
}

// Create account
module.exports.createAccount = async (req, res) => {
    try {
        const {email, username, password} = req.body;

        // Didn't do output sanitization, validation checks

        if (!email || !username || !password) return res.status(400).json({
            message: `Missing fields`
        });

        // Create account in stripe
        const customer = createStripeCustomer(email, username);
        const stripeCustomerID = customer.id;

        // Create account in our database
        await createAccount(username, email, password, stripeCustomerID);

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > account.js! " + error);
    }
};