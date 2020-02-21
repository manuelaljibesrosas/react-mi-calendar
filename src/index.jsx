/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { render } from 'react-dom';
import add from 'date-fns/add';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import store, { history } from './store';
// actions
import { addEvent } from './store/actions';
// components
import CalendarRoot from './components/Calendar';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/worker.js')
    .then((registration) => {
      console.log('registration successful', registration);
    })
    .catch((err) => {
      console.log('worker couldn\'t be installed', err);
    });
}

render(
  <div
    css={css`
      position: fixed; top: 0; left: 0;
      width: 100vw; height: 100%; display: flex; align-items: center; justify-content: center;
      background: #fff;
    `}
  >
    <div
      css={css`
        height: 100%;
        box-shadow: 0 4px 20px 0px #80808096;
      `}
    >
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <CalendarRoot calendarId="main" />
        </ConnectedRouter>
      </Provider>
    </div>
  </div>,
  // eslint-disable-next-line no-undef
  document.getElementById('root'),
);
