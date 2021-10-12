const { Op } = require("sequelize");

const { PaymentMethods } = require("../schemas/PaymentMethods");
const { Accounts_PaymentMethods } = require("../schemas/Accounts_PaymentMethods");
const { Accounts } = require("../schemas/Accounts");

// Insert Payment Method
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

// Update Payment Method
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

// Find Payment Method by ID
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

// Find Duplicate Payment Method
module.exports.findDuplicatePaymentMethod = (accountID, cardFingerprint, paymentMethodID) => Accounts.findOne({
    where: {
        account_id: accountID
    },
    include: {
        model: PaymentMethods,
        as: "payment_accounts",
        where: {
            stripe_payment_method_fingerprint: cardFingerprint,
            stripe_payment_method_id: {
                [Op.ne]: paymentMethodID
            }
        }
    }
});