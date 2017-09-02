// import './mockdata';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import './style/lib/animate.css';
import { Router, Route, hashHistory, IndexRedirect } from 'react-router';
import Page from './components/Page';
import Login from './components/pages/Login';
import CaseList from './components/case/CaseList';
import HistoryList from './components/case/HistoryList';
import { CaseNew, CaseEdit, CaseRecheck } from './components/case/CaseOps';
import MedicineMgmt from './components/medicine/MedicineMgmt';
import MedicineStockin from './components/medicine/MedicineStockin';
import MedicineStockout from './components/medicine/MedicineStockout';
import PrescribeList from './components/prescribe/PrescribeList';
import PersonalSetting from './components/pages/PersonalSetting';
import Dashboard from './components/dashboard/Dashboard';
import registerServiceWorker from './registerServiceWorker';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import reducer from './reducer';
import axios from 'axios';

const requireAuth = (nextState, replace) => {
    var user = null;

    if (nextState.location) {
        var { state } = nextState.location;

        if (state) {
            var data = state.data;

            if (data) {
                user = data;
            }
        }
    }

    if (!user) {
        user = JSON.parse(localStorage.getItem('user'));
    }

    if ((typeof user == 'undefined') || !user) {
        replace({ pathname: '/login' });
        return;
    }

    axios.post('/api/user/profile', {})
    .then(function (response) {
        var msg = response.data.msg;

        if (response.data.status != 0) {
            replace({ pathname: '/login' });
            return;
        }
    })
    .catch(function (error) {
        console.log(error);
    });
}

const routes =
    <Route path={'/'} components={Page}>
        <IndexRedirect to="/app/dashboard/index" />
        <Route path={'app'} component={App} onEnter={requireAuth}>
            <Route path={'case'}>
                <Route path={'list'} component={CaseList} />
                <Route path={'new'} component={CaseNew} />
                <Route path={'edit/:id'} component={CaseEdit} />
                <Route path={'recheck/:id'} component={CaseRecheck} />
                <Route path={'history'} component={HistoryList} />
            </Route>
            <Route path={'medicine'}>
                <Route path={'list'} component={MedicineMgmt} />
                <Route path={'inlist'} component={MedicineStockin} />
                <Route path={'outlist'} component={MedicineStockout} />
            </Route>
            <Route path={'prescribe'}>
                <Route path={'list'} component={PrescribeList} />
            </Route>
            <Route path={'personal'}>
                <Route path={'setting'} component={PersonalSetting} />
            </Route>
            <Route path={'dashboard/index'} component={Dashboard} />
        </Route>
        <Route path={'login'} components={Login} />
    </Route>;

// redux 注入操作
const middleware = [thunk];
const store = createStore(reducer, applyMiddleware(...middleware));

ReactDOM.render(
    <Provider store={store}>
        <Router history={hashHistory}>
            {routes}
        </Router>
    </Provider>
 ,
  document.getElementById('root')
);
registerServiceWorker();