import React from 'react';
import ReactDOM from 'react-dom';
import Routes from './Routes';
import config from './config/config';
import './assets/scss/main.scss';
import 'react-toastify/dist/ReactToastify.css';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePKTest = config.stripe.pk.test;
const promise = loadStripe(stripePKTest);

ReactDOM.render(
    <Elements stripe={promise}>
      <Routes />
    </Elements>,
  document.getElementById('deluxe-root')
);