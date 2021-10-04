// npm packages import
import React from 'react';
import { Route, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom';

// React components import
import Home from './pages/Home';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import Plans from './pages/Plans';
import SignUp from './pages/SignUp';


// Other imports
import { getToken } from './utilities/localStorageUtils';

// Guard to check if user has token
const authGuard = (Component) => (props) => {
    const token = getToken();
    if (!token) {
        return (<Redirect to="/landing" {...props} />);
    } else {
        return (<Component {...props} />);
    }

}

const Routes = () => {
    return (
        <Router>
            <Switch>
                <Route path ="/login" render={() => <Login />}/>
                <Route exact path="/">
                    <Redirect to="/home" />
                </Route>
                <Route path = "/home" render={() => <Home />} />
                <Route path = "/landing" render={() => <Landing />} />
                <Route path = "/checkout" render={(props) => authGuard(Checkout)(props)} />
                <Route path = "/signup" render={() => <SignUp />} />
                <Route path = "/plans" render={() => <Plans />} />
            </Switch>
        </Router>
    )
}

export default Routes;