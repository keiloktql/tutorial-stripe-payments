import React, { useState, useEffect } from "react";
import Title from '../layout/Title';
import productImg from '../assets/images/iphone_15_orange.jpg';

const Home = () => {

  // State declarations
  const productName = useState(null);
  const productDescription = useState(null);

  useEffect(() => {
    
  });

  return (
    <>
      <Title title="Home" />
      <div className="c-Home">
        {/* Checkout */}
        <div className="c-Home__Checkout">
          <h1>One Time Payment Demo</h1>
          <p>You will be redirected to the checkout page to fill in billing details</p>
          <div className="c-Home__Product-Card c-Product-Card">
            <div className="c-Product-Card__Top">
              <img src={productImg} alt = "Product"/>
              <h1></h1>
              <h2></h2>
            </div>
            <button type="button" className="c-Btn">Checkout</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
