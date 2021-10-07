require("dotenv").config();

module.exports = {
    port: parseInt(process.env.PORT),
    db: {
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },
    frontend: {
        baseUrl: "http://localhost:3000"
    },
    jwt: {
        secret: process.env.JWT_SECRET
    },
    stripe: {
        test: {
            secretKey: process.env.STRIPE_TEST_SK,
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
        }
    }
}