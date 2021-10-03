const config = require("../config/config");

// Test secret API Key
const stripe = require("stripe")(config.stripe.test.secretKey);

// Create payment intent
module.exports.createPaymentIntent = (totalPrice, stripeCustomerID, email) => stripe.paymentIntents.create({
  amount: totalPrice,
  currency: "sgd",
  customer: stripeCustomerID || null,
  receipt_email: email || null
});

// Create customer
module.exports.createStripeCustomer = (email, username) => stripe.customers.create({
  email,
  name: username
});