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
      overflow-x: hidden; overflow-y: auto;
    `}
  >
    <MonthDisplayGrid />
    <div
      css={css`
        padding: 0 15px; flex: 1; height: fit-content;

        @media (min-width: 421px) {
          margin: 0 20px;
        }
    `}
    >
      <EventList />
    </div>
    <AddEventButton />
  </div>
);

export default CalendarMonthDisplay;
