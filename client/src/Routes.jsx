// npm packages import
import React from 'react';
import { Route, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom';

// React components import
import Account from './pages/Account';
import ChangePlan from './pages/ChangePlan';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import Plans from './pages/Plans';
import SignUp from './pages/SignUp';
import LoggedOut from './pages/LoggedOut';
import PlansCheckout from './pages/PlansCheckout';

// Other imports
import { getToken } from './utilities/localStorageUtils';


// Guard to check if user has token
const authGuard = (Component) => (props) => {
    const token = getToken();

    if (!token) {
        return (<Redirect to="/logged-out" {...props} />);
    } else {
        return (<Component {...props} />);
    }
};

const Routes = () => {
    return (
        <Router>
            <Switch>
                <Route path="/login" render={() => <Login />} />
                <Route exact path="/">
                    <Redirect to="/home" />
                </Route>
                <Route path = "/account" render={() => <Account />} />
                <Route path="/home" render={(props) => authGuard(Home)(props)} />
                <Route path="/landing" render={() => <Landing />} />
                <Route path="/checkout" render={(props) => authGuard(Checkout)(props)} />
                <Route path="/signup" render={() => <SignUp />} />
                <Route exact path="/plans" render={() => <Plans />} />
                <Route path="/plans/payment/:type" render={(props) => authGuard(PlansCheckout)(props)} />
                <Route path="/plans/change" render={(props) => authGuard(ChangePlan)(props)} />
                <Route path="/logged-out" render={() => <LoggedOut />} />
            </Switch>
        </Router>
    );
};

export default Routes;