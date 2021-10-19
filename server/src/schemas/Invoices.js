const { DataTypes } = require("sequelize");
const db = require("../config/connection");

const { Subscriptions } = require("./Subscriptions");

const Invoices = db.define(
    "Invoices",
    {
        stripe_invoice_id: {
            type: DataTypes.STRING(255),
            primaryKey: true,
            autoIncrement: false
        },
        stripe_reference_number: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true
        },
        stripe_payment_intent_id: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true
        },
        stripe_client_secret: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true
        },
        stripe_payment_intent_status: {
            type: DataTypes.ENUM(["succeeded", "requires_payment_method", "requires_action", "canceled", "incomplete"]),
            allowNull: true
        },
        balance: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        amount: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        fk_stripe_subscription_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            references: {
                model: Subscriptions,
                key: "stripe_subscription_id"
            }
        },
        stripe_payment_method_fingerprint: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        stripe_card_exp_date: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        stripe_card_last_four_digit: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        stripe_card_type: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        paid_on: {
            type: "TIMESTAMP",
            allowNull: true
        }
    },
    {
        tableName: "invoices",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        paranoid: true,
        deletedAt: "deleted_at"
    }
);

Subscriptions.hasMany(Invoices, {
    foreignKey: "fk_stripe_subscription_id",
    as: "invoice"
});

Invoices.belongsTo(Subscriptions, {
    foreignKey: "fk_stripe_subscription_id",
    as: "subscription"
});

module.exports = { Invoices };