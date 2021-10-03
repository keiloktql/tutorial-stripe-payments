// npm packages import
import React from 'react';
import { Route, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom';

// React components import
import Login from './pages/Login';
import Home from './pages/Home';

// Other imports
import { getToken } from './utilities/localStorageUtils';

// Guard to check if user has token
const authGuard = (Component) => (props) => {
    const token = getToken();
    if (!token) {
        return (<Redirect to="/login" {...props} />);
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
            </Switch>
        </Router>
    )
}

export default Routes;