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
        stripe_schedule_id: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true
        },
        fk_change_plan_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            references: {
                model: Plans,
                key: "plan_id"
            }
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
            type: DataTypes.ENUM(["active", "canceled", "incomplete", "trialing", "past_due"]),
            allowNull: true
        },
        current_period_start: {
            type: "TIMESTAMP",
            allowNull: true
        },
        current_period_end: {
            type: "TIMESTAMP",
            allowNull: true
        },
        start_date: {
            // Timestamp when user starts subscription (includes free trial)
            type: "TIMESTAMP",
            allowNull: true
        },
        end_date: {
            // Timestamp when subscription is cancelled
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

Plans.hasMany(Subscriptions, {
    foreignKey: "fk_change_plan_id",
    as: "subscription"
});

Subscriptions.belongsTo(Plans, {
    foreignKey: "fk_change_plan_id",
    as: "change_plan"
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