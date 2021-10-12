import React from 'react';
import PageLayout from "../layout/PageLayout";

const Landing = () => {
    return (
        <PageLayout title="Deluxe">
            <div className="c-Landing">
                {/* Welcome */}
                <div className="c-Landing__Welcome">
                    <div className="c-Welcome__Description">
                        <h1>Payment features with Stripe Demo</h1>
                        <p>Refer to Github Repo for more information on testing this system</p>
                        <a href="https://github.com/keilokimnida/tutorial-stripe-payments" target="_blank" rel="noopener noreferrer">View GitHub Repo</a>
                    </div>
                </div>
            </div>
        </PageLayout>
    )
}

export default Landing;