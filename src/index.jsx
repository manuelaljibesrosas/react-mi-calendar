/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { render } from 'react-dom';
import add from 'date-fns/add';
import store from './store';
// actions
import { addEvent } from './store/actions';
// components
import CalendarRoot from './components/Calendar';

const sampleEvents = [
  {
    name: 'Meeting',
    start: new Date(2020, 1, 24),
    end: new Date(2020, 1, 25),
    description: 'Business appointment',
    location: 'San Francisco',
  },
  {
    name: 'some event',
    start: new Date(),
    end: add(new Date(), { days: 1 }),
    description: 'test',
    location: 'nowhere',
  },
  {
    name: 'Conference',
    start: new Date(2020, 1, 3),
    end: new Date(2020, 1, 3),
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
