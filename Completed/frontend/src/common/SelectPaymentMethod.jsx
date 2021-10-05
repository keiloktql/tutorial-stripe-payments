import React from 'react';
import MCSVG from "../assets/svg/MC.svg";
import visaSVG from "../assets/svg/Visa_2021.svg";
import amexSVG from "../assets/svg/Amex.svg";
import { ReactSVG } from 'react-svg';

const SelectPaymentMethod = ({ cardBrand, last4, expDate, stripePaymentMethodID, selectedPaymentMethod, index, handleSelectPaymentMethod, disabled }) => {
    const renderPaymentMethod = () => {
        if (cardBrand === "visa") {
            return <ReactSVG
                src={visaSVG}
                className="c-SVG__Visa"
            />
        } else if (cardBrand === "mastercard") {
            return <ReactSVG
                src={MCSVG}
                className="c-SVG__Master"
            />
        } else if (cardBrand === "amex") {
            return <ReactSVG
                src={amexSVG}
                className="c-SVG__Amex"
            />
        } else {
            return cardBrand;
        }
    };
    const disabledClassName = disabled ? " c-Select-payment-method--disabled" : "";
    const selectedMainClassName = selectedPaymentMethod === stripePaymentMethodID ? "c-Select-payment-method c-Select-payment-method--selected" + disabledClassName : "c-Select-payment-method" + disabledClassName;
    const selectedBannerClassName = selectedPaymentMethod === stripePaymentMethodID ? "c-Select-payment-method__Banner c-Select-payment-method__Banner--selected" : "c-Select-payment-method__Banner";

    return (
        <div className={disabled ? "l-Select-payment-method l-Select-payment-method--disabled" : "l-Select-payment-method"} >
            <div className = {selectedMainClassName} onClick={() => handleSelectPaymentMethod(stripePaymentMethodID)}>
                <span className={selectedBannerClassName}>Selected</span>
                <div className="c-Select-payment-method__Left">
                    <div className="c-Select-payment-method__SVG c-SVG">
                        {renderPaymentMethod()}
                    </div>
                    <p>●●●● {last4}</p>
                </div>
                <div className="c-Select-payment-method__Right">
                    <p>Exp. {expDate}</p>
                </div>
            </div>
        </div>
    )
}

export default SelectPaymentMethod;