const { Accounts } = require("../schemas/Accounts");
const { PaymentMethods } = require("../schemas/PaymentMethods");
const { Subscriptions } = require("../schemas/Subscriptions");

module.exports.findAccountByID = (accountID) => Accounts.findByPk(accountID, {
    include: [{
        model: PaymentMethods,
        as: "payment_accounts"
    }, {
        model: Subscriptions,
        as: "subscription"
    }] 
});

module.exports.createAccount = (username, email, password, stripeCustomerID) => Accounts.create({
    username,
    email,
    trialed: false,
    passwords: [{
        password: bcrypt.hashSync(password, 10)
    }],
    stripe_customer_id: stripeCustomerID
});

module.exports.updateAccountByID = (accountID, content) => Accounts.update({
    ...content
}, {
    where: {
        account_id: accountID
    }
})

module.exports.findAccountByStripeCustID = (stripeCustomerID) => Accounts.findOne({
    where: {
        stripe_customer_id: stripeCustomerID
    },
    include: [{
        model: PaymentMethods,
        as: "payment_accounts"
    }] 
});