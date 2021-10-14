const { Invoices } = require("../schemas/Invoices");

// Create Invoice
module.exports.createInvoice = (meta) => Invoices.create({
    ...meta
});

// Find Invoice
module.exports.findInvoice = (invoiceID) => Invoices.findOne({
    where: {
        stripe_invoice_id: invoiceID
    }
})

// Update Invoice
module.exports.updateInvoice = (invoiceID, meta) => Invoices.update({
    ...meta
}, {
    where: {
        stripe_invoice_id: invoiceID
    }
}
)