const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { jwt: { secret: jwtSecret } } = require("../config/config");
const { Accounts } = require("../model_definitions/Accounts");
const { Passwords } = require("../model_definitions/Passwords");

module.exports.clientLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        const account = await Accounts.findOne({
            where: { username },
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
            membership: account.membership
        }, jwtSecret, { expiresIn: "12h" });

        return res.status(200).json({
            message: "Success",
            found: true,
            locked: false,
            token,
            data: {
                username: account.username,
                email: account.email,
                firstname: account.firstname,
                lastname: account.lastname,
                membership: account.membership
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error! " + error);
    }
}