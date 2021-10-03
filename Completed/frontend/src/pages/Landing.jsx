import React from 'react';
import PageLayout from "../layout/PageLayout";

const Landing = () => {
    return (
        <PageLayout title="Deluxe">
            <div className="c-Landing">
                {/* Account Registration */}
                <div className="c-Landing__Register">
                    <h1>Account Registration Demo</h1>
                    <p></p>
                </div>
                {/* Plans */}
                <div className="c-Landing__Plans">
                    <h1>Subscribe to Plans Demo</h1>
                    <p>You are not subscribed to any plans</p>
                </div>
            </div>
        </PageLayout>
    )
}

export default Landing;