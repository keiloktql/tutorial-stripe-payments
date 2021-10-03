const { DataTypes } = require("sequelize");
const db = require("../config/connection");

const { Accounts } = require("./Accounts");

const Passwords = db.define(
    "Passwords",
    {
        password_id: {
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
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
    },
    {
        tableName: "passwords",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
);

Accounts.hasMany(Passwords, {
    foreignKey: "fk_account_id",
    as: "passwords"
});

Passwords.belongsTo(Accounts, {
    foreignKey: "fk_account_id",
    as: "account"
});

module.exports = { Passwords };