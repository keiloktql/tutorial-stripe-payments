const { PaymentMethods } = require("../schemas/PaymentMethods");
const { Accounts_PaymentMethods } = require("../schemas/Accounts_PaymentMethods");
const { Accounts } = require("../schemas/Accounts");

module.exports.insertPaymentMethod = async (accountID, paymentMethodID, cardFingerprint, cardLastFourDigit, cardType, cardExpDate) => {

    await PaymentMethods.create({
        payment_method_id: paymentMethodID,
        payment_method_fingerprint: cardFingerprint,
        card_last_four_digit: cardLastFourDigit,
        card_type: cardType,
        card_exp_date: cardExpDate,
    });

    try {
        await Accounts_PaymentMethods.create({
           fk_account_id: accountID,
           fk_payment_method_id: paymentMethodID
        });
    } catch (e) {
        console.log(e);
        PaymentMethods.destroy({
            where: {
                fk_account_id: accountID
            }
        });
        throw error;
    }
};

module.exports.updatePaymentMethod = (paymentMethodID, cardFingerprint, cardLastFourDigit, cardType, cardExpDate) => PaymentMethods.update({
    payment_method_fingerprint: cardFingerprint,
    last_four_digit: cardLastFourDigit,
    card_type: cardType,
    card_exp_date: cardExpDate,
}, {
    where: {
        payment_method_id: paymentMethodID
    }
});

module.exports.findPaymentMethod = (paymentMethodID) => PaymentMethods.findOne({
    where: {
        stripe_payment_method_id: paymentMethodID
    },
    include: {
        model: Accounts,
        as: "payment_methods"
    },
    order: [['stripe_payment_method_id', 'ASC']]
});