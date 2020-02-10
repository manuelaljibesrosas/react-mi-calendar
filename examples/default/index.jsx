/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { render } from 'react-dom';
import moment from 'moment';
import store from '../../src/store';
// actions
import { addEvent } from '../../src/store/actions';
// components
import CalendarRoot from '../../src/components/Calendar';

store.dispatch(addEvent({
  name: 'some event',
  start: moment(),
  end: moment().add(1, 'days'),
  description: 'test',
  location: 'nowhere',
}));

render(
  <div
    css={css`
      position: fixed; top: 0; left: 0;
      width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;
      background: #fff;
    `}
  >
    <div
      css={css`
        box-shadow: 0 4px 20px 0px #80808096;
      `}
    >
      <CalendarRoot calendarId="main" />
    </div>
  </div>,
  // eslint-disable-next-line no-undef
  document.getElementById('root'),
);

