const config = {
    baseUrl: `${process.env.REACT_APP_BASEURL}`,
    toastTiming: 1000,
    stripe: {
        pk: {
            test: `${process.env.REACT_APP_BASEURL_STRIPE_PK_TEST}`
        }
    }
}

export default config;