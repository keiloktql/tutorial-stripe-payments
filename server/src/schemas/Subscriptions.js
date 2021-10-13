const { DataTypes } = require("sequelize");
const db = require("../config/connection");

const { Accounts } = require("./Accounts");
const { PaymentMethods } = require("./PaymentMethods");
const { Plans } = require("./Plans");

const Subscriptions = db.define(
    "Subscriptions",
    {
        // Using stripe's subscription id
        stripe_subscription_id: {
            type: DataTypes.STRING(255),
            primaryKey: true,
            autoIncrement: false
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
        // Default payment method
        fk_payment_method: {
            type: DataTypes.STRING(255),
            allowNull: true,
            references: {
                model: PaymentMethods,
                key: "stripe_payment_method_id"
            }
        },
        stripe_status: {
            type: DataTypes.ENUM(["active", "canceled", "canceling", "incomplete", "trialing", "past_due"]),
            allowNull: true
        },
        current_period_start: {
            type: "TIMESTAMP",
            allowNull: true
        },
        current_period_end: {
            type: "TIMESTAMP",
            allowNull: true
        }
    },
    {
        tableName: "subscriptions",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
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
    foreignKey: "fk_payment_method",
    as: "subscription"
});

Subscriptions.belongsTo(PaymentMethods, {
    foreignKey: "fk_payment_method",
    as: "payment_method"
});


module.exports = { Subscriptions };