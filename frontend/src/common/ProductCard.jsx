import React from 'react'
import productImg from '../assets/images/iphone_15_orange.jpg';
import { useHistory } from "react-router";

const ProductCard = ({imageLink, name, description, price}) => {
    const history = useHistory();

    return (
        <div className="c-Product-card">
            <div className="c-Product-card__Top">
              {/* Product Image */}
              <img src={imageLink ? imageLink : productImg} alt="Product" />
              {/* Name and description */}
              <div className="c-Product-card__Info">
                <h1>{name ? name : "Error"}</h1>
                <p>{description ? description : "Error"}</p>
              </div>
              {/* Price */}
              <p>S${price ? price : "Error"}</p>
            </div>
            <button type="button" className="c-Btn c-Btn--stripe-purple" onClick={() => history.push("/checkout")}>Checkout</button>
          </div>
    )
}

export default ProductCard;