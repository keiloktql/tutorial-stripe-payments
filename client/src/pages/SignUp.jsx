import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useHistory } from "react-router-dom";
import config from "../config/config";
import PageLayout from "../layout/PageLayout";
import Loading from "../common/Loading";
import { toast } from "react-toastify";

const SignUp = () => {
    const history = useHistory();
    // State declaration
    const [inputValues, setInputValues] = useState({
        email: "",
        username: "",
        password: "",
    });
    const [signupDisabled, setSignUpDisabled] = useState(true);
    const [loading, setLoading] = useState(false);

    // Track if all the fields has been entered
    useEffect(() => {
        let componentMounted = true;

        if (componentMounted) {
            if (inputValues.email !== "" && inputValues.username !== "" && inputValues.password !== "") {
                setSignUpDisabled(() => false);
            } else {
                setSignUpDisabled(() => true);
            }
        }

        return (() => {
            componentMounted = false;
        });
    }, [inputValues]);

    // Handlers
    const handleInputChange = (event) => {
        setInputValues((prevState) => ({
            ...prevState,
            [event.target.name]: event.target.value,
        }));
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        if (loading) {
            return;
        }
        
        setLoading(() => true);

        try {
            await axios.post(`${config.baseUrl}/account`, {
                email: inputValues.email,
                username: inputValues.username,
                password: inputValues.password
            }, {});
            setTimeout(() => {
                toast.success(<>Success!<br />Message: <b>Account has been created!</b></>);
            }, 0);
            history.push('/login');
        } catch (error) {
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

    return (
        <PageLayout title="Sign Up">
            <div className="c-Sign-up">
                {/* Registration Card */}
                <form className="l-Sign-up__Card" onSubmit={(event) => handleFormSubmit(event)}>
                    {
                        loading ?
                            <div className="c-Sign-up__Card">
                                <Loading />
                            </div> :
                            <div className="c-Sign-up__Card">
                                <div className="c-Card__Header">
                                    <h1>Sign Up</h1>
                                </div>
                                {/* Email */}
                                <div className="c-Card__Input">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={inputValues.email}
                                        placeholder="Enter email"
                                        onChange={handleInputChange}
                                    />
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
                                <button disabled={signupDisabled} type="submit" className={signupDisabled ? "c-Btn--disabled c-Btn" : "c-Btn"}>
                                    Sign Up
                                </button>
                                <div className="c-Card__Login">
                                    <p>Already have an account?</p>
                                    <NavLink to="/login">Login</NavLink>
                                </div>
                            </div>

                    }

                </form>
            </div>
        </PageLayout>
    )
}

export default SignUp;