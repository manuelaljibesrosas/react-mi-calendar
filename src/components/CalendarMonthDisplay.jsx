/** @jsx jsx */
import { jsx, css } from '@emotion/core';
// components
import MonthDisplayGrid from './MonthDisplayGrid';
import EventList from './EventList';
import AddEventButton from './AddEventButton';

const CalendarMonthDisplay = () => (
  <div
    css={css`
      height: 100%; display: flex; flex-direction: column;
    `}
  >
    <MonthDisplayGrid />
    <div
      css={css`
      margin: 5px 0;
        padding: 0 15px; flex: 1; overflow: auto;
    `}
    >
      <EventList />
    </div>
    <AddEventButton />
  </div>
);

export default CalendarMonthDisplay;
