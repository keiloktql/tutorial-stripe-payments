import React, { useState, useEffect } from "react";
import axios from "axios";
import config from '../config/config';
import { getToken } from '../utilities/localStorageUtils';
import { useHistory } from "react-router";
import ProductCard from "../common/ProductCard";
import { NavLink } from "react-router-dom";
import CreditCard from "../common/CreditCard";
import PageLayout from "../layout/PageLayout";
import HomeBentoBox from "../common/HomeBentoBox";

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
  const [exclusiveContent, setExclusiveContent] = useState({
    all: null,
    standard: null,
    premium: null
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
        const errCode = error.response.status;
        if (errCode === 401) {
          history.push("/logged-out");
        }
      }

      try {
        // Get exclusive content, access: all
        const response = await axios.get(`${config.baseUrl}/exclusive-contents/all`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (componentMounted) {
          const ecData = response.data;
          if (ecData.exclusiveContent?.length > 0) {
            setExclusiveContent((prevState) => ({
              ...prevState,
              all: ecData?.exclusiveContent[0]
            }));
          }
        }
      } catch (error) {
        console.log(error);
      }

      try {
        // Get exclusive content, access: Premium, standard, free trial users only
        const response = await axios.get(`${config.baseUrl}/exclusive-contents/standard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (componentMounted) {
          const ecData = response.data;
          if (ecData.exclusiveContent?.length > 0) {

            setExclusiveContent((prevState) => ({
              ...prevState,
              standard: ecData?.exclusiveContent[0]
            }));
          }
        }
      } catch (error) {
        console.log(error);
      }

      try {
        // Get exclusive content, access: Premium and free trial users only
        const response = await axios.get(`${config.baseUrl}/exclusive-contents/premium`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (componentMounted) {
          const ecData = response.data;
          if (ecData.exclusiveContent?.length > 0) {
            setExclusiveContent((prevState) => ({
              ...prevState,
              premium: ecData?.exclusiveContent[0]
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

          {/* Subscription visibility demo */}
          <div className="c-Home__Subscription">
            <h1>Test your subscription here</h1>
            <p>The higher your subscription level, the more content you will be able to see</p>
            <NavLink to="/account" >Manage Subscription</NavLink>
            <div className="c-Home__Subscription-legend c-Subscription-legend">
              <h2>Visibility</h2>
              <ul>
                <li>
                  <span className="c-Subscription-legend__All"></span>
                  <p>All Users</p>
                </li>
                <li>
                  <span className="c-Subscription-legend__Standard"></span>
                  <p>Standard, Premium and Free Trial Users only</p>
                </li>
                <li>
                  <span className="c-Subscription-legend__Premium"></span>
                  <p>Premium and Free trial users only</p>
                </li>
              </ul>
            </div>
            <div className="c-Home__Bento-boxes">
              <HomeBentoBox content={exclusiveContent.all?.content} heading="All users" variation={1} />
              <HomeBentoBox content={exclusiveContent.standard?.content} variation={2} />
              <HomeBentoBox content={exclusiveContent.premium?.content} variation={3} />
            </div>
          </div>

        </div>
      </PageLayout>
    </>
  );
};

export default Home;
