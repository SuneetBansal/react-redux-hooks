/**
 * @author: Suneet Bansal
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { AppContainer } from 'react-hot-loader';
import { StoreContext } from 'redux-react-hook';

import { reducer } from './reducer';
import App from './App';

const store = createStore(reducer);

const render = (Component) =>
ReactDOM.render(
    <AppContainer>
        <StoreContext.Provider value={store}>
            <Component />
        </StoreContext.Provider>
    </AppContainer>,
    document.getElementById('root'),
);

render(App);

if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('./App', () => { render(App) });
}
