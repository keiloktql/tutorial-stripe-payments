const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const { jwt: { secret: jwtSecret } } = require("../config/config");
const { Accounts } = require("../schemas/Accounts");
const { Passwords } = require("../schemas/Passwords");

module.exports.clientLogin = async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;

        const account = await Accounts.findOne({
            where: { 
                [Op.or]: [
                    {
                        username: usernameOrEmail
                    },
                    {
                        email: usernameOrEmail
                    }
                ]
             },
            include: {
                model: Passwords,
                as: "passwords",
                where: { active: true },
                limit: 1
            }
        });

        // no account matching username
        if (!account) return res.status(404).json({
            message: "Account not found",
            found: false,
            locked: null,
            token: null,
            data: null
        });

        // because of the one-to-many r/s btw account and passwords,
        // passwords is an array even though theres only one active password
        const { password: hash } = account.passwords[0];

        const valid = bcrypt.compareSync(password, hash);

        if (!valid) {
            // incorrect password
            return res.status(401).json({
                message: "Invalid password",
                found: true,
                locked: false,
                token: null,
                data: null
            });
        }
        // generate token
        const token = jwt.sign({
            account_id: account.account_id,
            username: account.username,
            email: account.email,
        }, jwtSecret, { expiresIn: "12h" });

        return res.status(200).json({
            message: "Success",
            found: true,
            locked: false,
            token,
            data: {
                username: account.username,
                email: account.email,
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error! " + error);
    }
}