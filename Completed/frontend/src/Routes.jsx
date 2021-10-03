// npm packages import
import React from 'react';
import { Route, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom';

// React components import
import Home from './pages/Home';
import Landing from './pages/Landing';
import Login from './pages/Login';

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
                <Route path = "/home" render={(props) => authGuard(Home)(props)} />
                <Route path = "/landing" render={() => <Landing />} />
            </Switch>
        </Router>
    )
}

export default Routes;