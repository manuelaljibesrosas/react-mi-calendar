/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { render } from 'react-dom';
import moment from 'moment';
import store from './store';
// actions
import { addEvent } from './store/actions';
// components
import CalendarRoot from './components/Calendar';

const formatStr = 'YYYY-MM-DD';

const sampleEvents = [
  {
    name: 'Meeting',
    start: moment('2020-02-24', formatStr),
    end: moment('2020-02-25', formatStr),
    description: 'Business appointment',
    location: 'San Francisco',
  },
  {
    name: 'some event',
    start: moment(),
    end: moment().add(1, 'days'),
    description: 'test',
    location: 'nowhere',
  },
  {
    name: 'Conference',
    start: moment('2020-02-03', formatStr),
    end: moment('2020-02-03', formatStr),
    description: 'conference',
  },
];

sampleEvents.forEach((e) => store.dispatch(addEvent(e)));

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
      <CalendarRoot calendarId="main" />
    </div>
  </div>,
  // eslint-disable-next-line no-undef
  document.getElementById('root'),
);
