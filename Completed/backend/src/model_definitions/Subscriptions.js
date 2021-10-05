const { DataTypes } = require("sequelize");
const db = require("../config/connection");

const { Accounts } = require("./Accounts");
const { PaymentMethods } = require("./PaymentMethods");
const { Plans } = require("./Plans");

const Subscriptions = db.define(
    "Subscriptions",
    {
        stripe_subscription_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        fk_plan_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Plans,
                key: "plan_id"
            }
        },
        fk_account_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Accounts,
                key: "account_id"
            }
        },
        // Stripe
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
        fk_payment_method: {
            type: DataTypes.STRING(255),
            allowNull: true,
            references: {
                model: PaymentMethods,
                key: "stripe_payment_method_id"
            }
        },
        stripe_payment_intent_status: {
            type: DataTypes.ENUM(["succeeded", "requires_payment_method", "requires_action"]),
            allowNull: true
        },
        stripe_status: {
            type: DataTypes.ENUM(["active", "past_due", "unpaid", "canceled", "incomplete", "incomplete_expired", "trialing"]),
            allowNull: true
        },
        stripe_next_billing_date: {

        },
        // to add start date here too and subscription status
    },
    {
        tableName: "subscriptions",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        paranoid: true,
        deletedAt: "deleted_at"
    }
);

Accounts.hasMany(Subscriptions, {
    foreignKey: "fk_account_id",
    as: "subscription"
});

Subscriptions.belongsTo(Accounts, {
    foreignKey: "fk_account_id",
    as: "account"
});

Plans.hasMany(Subscriptions, {
    foreignKey: "fk_plan_id",
    as: "subscription"
});

Subscriptions.belongsTo(Plans, {
    foreignKey: "fk_plan_id",
    as: "plan"
});

PaymentMethods.hasMany(Subscriptions, {
    foreignKey: "fk_plan_id",
    as: "subscription"
});

Subscriptions.belongsTo(PaymentMethods, {
    foreignKey: "fk_plan_id",
    as: "payment_method"
});


module.exports = { Subscriptions };