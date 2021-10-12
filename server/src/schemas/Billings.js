const { DataTypes } = require("sequelize");
const db = require("../config/connection");

const { Subscriptions } = require("./Subscriptions");

const Billings = db.define(
    "Billings",
    {
        billing_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        amount: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        // Stripe
        fk_stripe_subscription_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Subscriptions,
                key: "stripe_subscription_id"
            }
        },
        stripe_payment_intent_id: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        stripe_payment_method_fingerprint: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        stripe_card_exp_date: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        stripe_card_last_four_digit: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        stripe_card_type: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
    },
    {
        tableName: "billings",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        paranoid: true,
        deletedAt: "deleted_at"
    }
);

Subscriptions.hasMany(Billings, {
    foreignKey: "fk_stripe_subscription_id",
    as: "billing"
});

Billings.belongsTo(Subscriptions, {
    foreignKey: "fk_stripe_subscription_id",
    as: "subscription"
});

module.exports = { Billings };