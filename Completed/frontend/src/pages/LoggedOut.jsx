import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import config from '../config/config';
import { getToken } from '../utilities/localStorageUtils';
import { useHistory } from 'react-router';
import jwt_decode from "jwt-decode";
import PageLayout from "../layout/PageLayout";

const LoggedOut = () => {

    const token = getToken();
    const history = useHistory();
    let accountID;
    if (token) {
        const decodedToken = jwt_decode(token);
        accountID = decodedToken.account_id;
    }

    useEffect(() => {

        (async () => {
            if (token) {
                // Check if user is already signed in
                try {
                    await axios.get(`${config.baseUrl}/account/${accountID}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    history.push("/");
                } catch (error) {
                    console.log(error);
                }
            }
        })()

    }, []);

    return (
        <PageLayout title="Logged Out">
            <div className="c-Logged-out">
                <h1>You are logged out!</h1>
                <p>Please login to continue.</p>
                <NavLink to="/login">Go to login</NavLink>
            </div>
        </PageLayout>
    )
}

export default LoggedOut;