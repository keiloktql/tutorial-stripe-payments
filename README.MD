# Repo for 'Stripe with React & NodeJS' guide.

This system is a simple user management system with subscription plans and one time payment.

![](https://raw.githubusercontent.com/keilokimnida/tutorial-stripe-payments/main/screenshots/Deluxe_Home.png)

# Project Set Up

## Stripe

- Setup account on Stripe
- Setup webhook events, you should listen to the following 8 events
  - customer.subscription.updated
  - customer.updated
  - invoice.paid
  - invoice.payment_action_required
  - invoice.payment_failed
  - payment_intent.succeeded
  - payment_method.automatically_updated
- Refer to the pdf guide found in docs folder to find out what are webhooks and how to set up webhooks

## Client

- Run `npm i` to install the necessary dependencies
- Create a new `.env` file and paste this inside and **make any necessary changes**:
- `REACT_APP_BASEURL_STRIPE_PK_TEST` api key can be obtained from https://dashboard.stripe.com/test/apikeys

  ```
  REACT_APP_BASEURL=http://localhost:4242/api/v1
  REACT_APP_BASEURL_STRIPE_PK_TEST=
  ```

## Server

- Run `npm i` to install the necessary dependencies
- Run the SQL init file located in `database/init.sql`
- Create a new `.env` file and paste this inside and **make any necessary changes**:
- `REACT_APP_BASEURL_STRIPE_PK_TEST` api key can be obtained from https://dashboard.stripe.com/test/apikeys
- `STRIPE_TEST_WEBHOOK_SECRET` can be found in your webhook settings in the Developer Dashboard (only exists after your webhooks have been set up)

  ```
  PORT=4242
  DB_HOST=localhost
  DB_NAME=deluxe
  DB_PORT=3306
  DB_USER=root
  DB_PASSWORD=

  JWT_SECRET=

  STRIPE_TEST_SK=
  STRIPE_TEST_WEBHOOK_SECRET=
  ```
### Seeding Data

- This step is required when starting the application for the first time
- To seed data, ensure that in `index.js` line 41,

```Javascript
const reset = true;
```

- Next, start the server
- Upon completion of the seeding process, set reset to false to prevent table drop and seeding of new data when starting the server again

## ngrok
- ngrok will be required to connect your local development server to the internet
- Connecting the server to the internet will enable us to listen to webhook events emitted by Stripe
- Download ngrok
- Sign up for an account on ngrok
- Open up command prompt/terminal 
- run ``ngrok http 4242`` to listen to the server