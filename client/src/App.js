import React, { Fragment, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Alert from './components/layout/Alert';
import { loadUser } from './actions//auth';
import './App.css';
import { Provider } from 'react-redux';
import store from './store';
import setAuthToken from './utils/setAuthToken';
import Dashboard from './components/dashboard/Dashboard';
import PrivateRoute from './components/routing/PrivateRoute';
import CreateProfile from './components/profile-form/CreateProfile';
import EditProfile from './components/profile-form/EditProfile';
import AddExperience from './components/profile-form/AddExperience';
import AddEducation from './components/profile-form/AddEducation';
import Profiles from './components/profiles/Profiles';

if(localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
  <Provider store = {store}>
    <Router>
      <Fragment>
        <Navbar />
        <Alert />
        <Routes>
          <Route exact path="/" element={ <Landing /> } />
          <Route exact path="register" element={ <Register /> } />
          <Route exact path="login" element={ <Login /> } />
          <Route exact path="profiles" element={ <Profiles /> } />
          <PrivateRoute exact path="dashboard" element={ <Dashboard /> } />
          <PrivateRoute exact path='create-profile' element={ <CreateProfile /> } />
          <PrivateRoute exact path='edit-profile' element={ <EditProfile /> } />
          <PrivateRoute exact path='add-experience' element={ <AddExperience /> } />
          <PrivateRoute exact path='add-education' element={ <AddEducation /> } />
        </Routes>
      </Fragment>
    </Router>
  </Provider>
)};

export default App;
