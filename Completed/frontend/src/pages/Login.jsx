import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { saveUserToken } from "../utilities/localStorageUtils";
import { NavLink, useHistory } from "react-router-dom";
import config from "../config/config";
import PageLayout from "../layout/PageLayout";
import Loading from "../common/Loading";

const Login = () => {
    const history = useHistory();

    // State declaration
    const [inputValues, setInputValues] = useState({
        usernameOrEmail: "",
        password: "",
    });
    const [loginDisabled, setLoginDisabled] = useState(true);
    const [loading, setLoading] = useState(false);

    // Track if all the fields has been entered
    useEffect(() => {
        let componentMounted = true;

        if (componentMounted) {
            if (inputValues.usernameOrEmail !== "" && inputValues.password !== "") {
                setLoginDisabled(() => false);
            } else {
                setLoginDisabled(() => true);
            }
        }

        return (() => {
            componentMounted = false;
        });
    }, [inputValues]);

    // Handlers
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        if (loading) {
            return;
        }
        setLoading(() => true);
        try {
            const loginResponse = await axios.post(`${config.baseUrl}/login`, {
                usernameOrEmail: inputValues.usernameOrEmail,
                password: inputValues.password,
            });

            console.log(loginResponse);
            const loginData = loginResponse.data;
            saveUserToken(loginData.token);
            setTimeout(() => {
                history.push("/home");
            }, 5000);

        } catch (error) {
            console.log(error);
            let errCode = "Error!";
            let errMsg = "Error!";
            if (error.response !== undefined) {
                errCode = error.response.status;
                errMsg = error.response.data.message;
            }
            toast.error(
                <>
                    Error Code: <b>{errCode}</b>
                    <br />
                    Message: <b>{errMsg}</b>
                </>
            );
            setLoading(() => false);
        }
    };

    const handleInputChange = (event) => {
        setInputValues((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value,
        }));
    };

    return (
        <PageLayout title="Login">
            <div className="c-Login">
                {/* Login Card */}
                <form
                    className="l-Login__Card"
                    onSubmit={(event) => handleFormSubmit(event)}
                >
                    {
                        loading ?
                            <div className="c-Login__Card">
                                <Loading />
                            </div>
                            :
                            <div className="c-Login__Card">
                                <div className="c-Card__Header">
                                    <h1>Login</h1>
                                </div>
                                {/* Username Or Email */}
                                <div className="c-Card__Input">
                                    <label htmlFor="usernameOrEmail">Username/Email</label>
                                    <input
                                        type="text"
                                        name="usernameOrEmail"
                                        value={inputValues.usernameOrEmail}
                                        placeholder="Enter username or email"
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
                                <button disabled={loginDisabled} type="submit" className={loginDisabled ? "c-Btn--disabled c-Btn" : "c-Btn"}>
                                    Login
                                </button>
                                <div className="c-Card__Sign-up">
                                    <p>Need an account?</p>
                                    <NavLink to="/signup">Sign Up</NavLink>
                                </div>
                            </div>

                    }

                </form>
            </div>
        </PageLayout>
    );
};

export default Login;
