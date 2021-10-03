const { DataTypes } = require("sequelize");
const db = require("../config/connection");
const { Accounts } = require("./Accounts");
const { PaymentMethods } = require("./PaymentMethods");


const Accounts_PaymentMethods = db.define(
    "Accounts_PaymentMethods",
    {
        accounts_payment_methods_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        fk_account_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Accounts,
                key: "account_id"
            },
        },
        fk_payment_methods_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            references: {
                model: PaymentMethods,
                key: "payment_method_id"
            },
        },
    },
    {
        tableName: "accounts_pm",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

Accounts.belongsToMany(PaymentMethods, {
    through: Accounts_PaymentMethods, // using our own join table
    foreignKey: "fk_account_id",
    as: {
        singular: "payment_account",
        plural: "payment_accounts"
    } // an account can have many payment methods
});

PaymentMethods.belongsToMany(Accounts, {
    through: Accounts_PaymentMethods, // using our own join table
    foreignKey: "payment_method_id",
    as: {
        singular: "payment_method",
        plural: "payment_methods"
    } // a category can have many games
});

module.exports = { Accounts_PaymentMethods };