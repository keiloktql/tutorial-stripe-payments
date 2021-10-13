const { Invoices } = require("../schemas/Invoices");

// Create Invoice
module.exports.createInvoice = (meta) => Invoices.create({
    stripe_invoice_id: meta.invoiceID,
    amount: meta.amount,
    fk_stripe_subscription_id: meta.subscriptionID,
    stripe_period_start: meta.periodStart,
    stripe_period_end: meta.periodEnd,
    stripe_payment_intent_id: meta.paymentIntentID,
    stripe_payment_method_fingerprint: meta.fingerprint,
    stripe_card_exp_date: meta.cardExpDate,
    stripe_card_last_four_digit: meta.cardLastFourDigit,
    stripe_card_type: meta.cardType
});

// Find Invoice
module.exports.findInvoice = (invoiceID) => Invoices.findOne({
    where: {
        stripe_invoice_id: invoiceID
    }
})

// Update Invoice
module.exports.updateInvoice = (invoiceID, meta) => Invoices.update({
    
    
    where: {
        stripe_invoice_id: invoiceID
    }
})