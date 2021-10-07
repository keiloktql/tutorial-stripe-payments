import React from 'react';
import Helmet from "react-helmet";

const Title = ({title}) => {
    const defaultTitle = "Deluxe";
    return (
        <Helmet>
            <meta charSet="utf-8"/>
            <title>{title ? title : defaultTitle}</title>
        </Helmet>
    )
}

export default Title;