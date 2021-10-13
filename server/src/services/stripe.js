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

// Update payment intent
module.exports.updatePaymentIntent = (paymentIntentID, totalPrice) => stripe.paymentIntents.update(
  paymentIntentID, {
  amount: totalPrice,
  currency: "sgd"
});

// Create customer
module.exports.createStripeCustomer = (email, username) => stripe.customers.create({
  email,
  name: username
});

// Update customer
module.exports.updateStripeCustomer = (customerID, meta) => stripe.customers.update(
  customerID,
  meta
);

// Detach payment method
module.exports.detachPaymentMethod = (paymentMethodID) => stripe.paymentMethods.detach(
  paymentMethodID
);

// Find payment method
module.exports.findPaymentMethodFromStripe = (paymentMethodID) => stripe.paymentMethods.retrieve(
  paymentMethodID
);

// Find payment intent
module.exports.findPaymentIntent = (paymentIntentID) => stripe.paymentIntents.retrieve(
  paymentIntentID
);

// Create setup intent
module.exports.createSetupIntent = (customerID) => stripe.setupIntents.create({
  customer: customerID,
});

// Create subscription
module.exports.createSubscriptionInStripe = (customerID, subscriptionPriceID, email) => stripe.subscriptions.create({
  customer: customerID,
  items: [{
    price: subscriptionPriceID
  }],
  payment_behavior: 'default_incomplete',
  proration_behavior: 'always_invoice',
  expand: ['latest_invoice.payment_intent'],
  receipt_email: email // setting email for receipt_email will tell Stripe to automatically  send email for successful payments
});

// Update subscription (general) to be done tmr
module.exports.updateSubscriptionInStripe = (subscriptionID, meta) => stripe.subscriptions.update(
  subscriptionID,
  {
    ...meta,
    cancel_at_period_end: false,
  }
);

// Cancel subscription
module.exports.cancelSubscription = (stripeSubscriptionID) => stripe.subscriptions.del(
  stripeSubscriptionID, {
    cancel_at_period_end: true // by default, Stripe cancels subscription immediately.
                               // Having this option will tell Stripe to cancel only the
                               // end of the current billing period
  }
);

// Find invoice
module.exports.findInvoiceInStripe = (latestInvoiceID) => await stripe.invoices.retrieve(
  latestInvoiceID
);