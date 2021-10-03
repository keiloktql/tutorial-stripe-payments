import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import { clearLocalStorage, getToken } from "../utilities/localStorageUtils";
import axios from "axios";
import config from "../config/config";
import jwt_decode from "jwt-decode";
import Tooltip from "@material-ui/core/Tooltip";
import useComponentVisible from "../hooks/useComponentVisible";

const Header = () => {
    const history = useHistory();
    const token = getToken();

    // State declaration
    const [isProfilePopUpOpen, setIsProfilePopUpOpen] = useState(false);
    const { ref } = useComponentVisible(
        isProfilePopUpOpen,
        setIsProfilePopUpOpen
    );

    // Handler
    const handleProfilePicClick = () => {
        setIsProfilePopUpOpen((prevState) => !prevState);
    };

    const handleLogOutClick = () => {
        clearLocalStorage();
        history.push("/login");
        setTimeout(() => {
            toast.success("Successfully logged out!");
        }, 0);
    };

    return (
        <header className="l-Header">
            <div className="c-Header">
                {/*Left section  */}
                <div className="c-Header__Left">
                    <div className="c-Logo">
                        <NavLink to="/products">Deluxe</NavLink>
                    </div>
                </div>
                {/* Right section */}
                <div className="c-Header__Right">
                    <div className="c-Header__Links">
                        <NavLink to="/products">Products</NavLink>
                        <NavLink to="/membership">Membership</NavLink>
                    </div>
                    <div className="c-Header__Icons">
                        <div className="c-Header__Account" ref={ref}>
                            <Tooltip title="Account" arrow>
                                <div
                                    className="c-Header__Avatar"
                                    onClick={handleProfilePicClick}
                                ></div>
                            </Tooltip>
                            {isProfilePopUpOpen ? (
                                token ? (
                                    <div className="l-Header__Profile-pop-up">
                                        <div className="c-Header__Profile-pop-up">
                                            <button onClick={() => history.push("/account")}>
                                                My Account
                                            </button>
                                            <hr />
                                            <button onClick={handleLogOutClick}>Log out</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="l-Header__Profile-pop-up">
                                        <div className="c-Header__Profile-pop-up">
                                            <button onClick={() => history.push("/login")}>
                                                Login
                                            </button>
                                        </div>
                                    </div>
                                )
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
