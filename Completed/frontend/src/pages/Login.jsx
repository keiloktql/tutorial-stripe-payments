import axios from "axios";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { saveUserToken } from "../utilities/localStorageUtils";
import { useHistory } from "react-router-dom";

import config from "../config/config";
import Title from "../layout/Title";
import Header from "../layout/Header";

const Login = () => {
    const toastTiming = config.toastTiming;
    const history = useHistory();

    // State declaration
    const [inputValues, setInputValues] = useState({
        username: "",
        password: "",
    });

    // Handlers
    const handleFormSubmit = (event) => {
        event.preventDefault();
        axios
            .post(`${config.baseUrl}/login`, {
                username: inputValues.username,
                password: inputValues.password,
            })
            .then((res) => {
                console.log(res);
                const data = res.data;
                saveUserToken(data.token);
                history.push("/home");
            })
            .catch((err) => {
                console.log(err);
                let errCode = "Error!";
                let errMsg = "Error!";
                if (err.response !== undefined) {
                    errCode = err.response.status;
                    errMsg = err.response.data.message;
                }
                toast.error(
                    <>
                        Error Code: <b>{errCode}</b>
                        <br />
                        Message: <b>{errMsg}</b>
                    </>
                );
            });
    };

    const handleInputChange = (event) => {
        setInputValues((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value,
        }));
    };

    return (
        <>
            <ToastContainer
                position="top-center"
                autoClose={toastTiming}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <Title title="Login" />
            <Header />
            <div className="c-Login">
                {/* Login Card */}
                <form
                    className="l-Login__Card"
                    onSubmit={(event) => handleFormSubmit(event)}
                >
                    <div className="c-Login__Card">
                        <div className="c-Card__Header">
                            <h1>Login</h1>
                        </div>
                        {/* Username */}
                        <div className="c-Card__Input">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={inputValues.username}
                                placeholder="Enter username"
                                onChange={handleInputChange}
                            />
                        </div>
                        {/* Password */}
                        <div className="c-Card__Input">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={inputValues.password}
                                placeholder="Enter password"
                                onChange={handleInputChange}
                            />
                        </div>
                        <button type="submit" className="c-Btn">
                            Login
                        </button>
                    </div>
                    {/* Todo: Add sign up button */}
                </form>
            </div>
        </>
    );
};

export default Login;
