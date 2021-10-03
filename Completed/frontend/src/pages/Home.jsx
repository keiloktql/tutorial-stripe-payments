import React, { useState, useEffect } from "react";
import axios from "axios";
import config from '../config/config';
import { getToken } from '../utilities/localStorageUtils';
import { useHistory } from "react-router";
import ProductCard from "../common/ProductCard";
import { NavLink } from "react-router-dom";
import CreditCard from "../common/CreditCard";
import PageLayout from "../layout/PageLayout";

const Home = () => {

  const token = getToken();
  const history = useHistory();

  // State declarations
  const [productInfo, setProductInfo] = useState({
    id: null,
    name: null,
    description: null,
    price: null,
    imageLink: null
  });

  useEffect(() => {
    let componentMounted = true;

    (async () => {

      try {
        // Get product information
        const productsResponse = await axios.get(`${config.baseUrl}/products`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (componentMounted) {
          const productsData = productsResponse.data;

          if (productsData.length > 0) {
            setProductInfo(() => ({
              id: productsData[0].product_id,
              name: productsData[0].name,
              description: productsData[0].description,
              price: productsData[0].price,
              imageLink: productsData[0].imageLink
            }));
          }
        }
      } catch (error) {
        console.log(error);
      }

    })();

    return (() => {
      componentMounted = false;
    });
  }, []);

  return (
    <>
      <PageLayout title="Home">
        <div className="c-Home">
          {/* Checkout */}
          <div className="c-Home__Checkout">
            <h1>One Time Payment Demo</h1>
            <p>You will be redirected to the checkout page to fill in billing details</p>
            <ProductCard
              imageLink={productInfo.imageLink}
              name={productInfo.name}
              description={productInfo.description}
              price={productInfo.price}
            />
          </div>

          {/* Credit Card */}
          <div className="c-Home__Cards">
            <h1>Add Credit Card Demo</h1>
            <NavLink to="/account" >Go to Account</NavLink>
            <CreditCard last4="4242" expDate="12/24" />
          </div>

        </div>
      </PageLayout>
    </>
  );
};

export default Home;
