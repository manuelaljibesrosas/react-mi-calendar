/** @jsx jsx */
import React from 'react';
import {
  connect,
  Provider,
} from 'react-redux';
import { lifecycle } from 'recompose';
import { jsx, css } from '@emotion/core';
import PropTypes from 'prop-types';
import store from '../store';
import { views } from '../store/constants';
// selectors
import {
  selectNavigationHistory,
  selectView,
} from '../store/selectors';
// components
import EventDetails from './EventDetails';
import AddEvent from './AddEvent';
import Events from './Events';
import CalendarHeader from './CalendarHeader';
import CalendarMonthDisplay from './CalendarMonthDisplay';
import EditEvent from './EditEvent';

const calendarContainer = connect(
  (state) => ({
    navigationHistory: selectNavigationHistory(state),
    view: selectView(state),
  }),
);

const Wrapper = ({ children }) => (
  <div
    css={css`
      position: absolute; left: 0; top: 0;
      width: 100%; height: 100%;
      background: whitesmoke;
    `}
  >
    {children}
  </div>
);

Wrapper.propTypes = {
  children: PropTypes.element.isRequired,
};

export const PureCalendar = ({
  anchor,
  navigationHistory,
  view,
}) => (
  <div
    ref={anchor}
    css={css`
      position: relative;
      max-width: 100vw; width: 600px; overflow-x: hidden; overflow-y: auto; height: 100%;
      background-color: #f5f5f5;
      font-family: Roboto, sans-serif;
      user-select: none;

      & * {
        box-sizing: border-box;
      }
    `}
  >
    <div
      css={css`
        display: flex; flex-direction: column; height: 100%;
        padding: 12px 2px;
      `}
    >
      <CalendarHeader />
      <div
        css={css`
          position: relative;
          flex: 1; overflow: hidden;
        `}
      >
        <CalendarMonthDisplay />
        {
          (
            (view === views.EVENTS)
            && view !== views.CALENDAR
          )
          && (
            <Wrapper>
              <Events />
            </Wrapper>
          )
        }
      </div>
    </div>
    {
      (view === views.ADD_EVENT)
      && (
        <Wrapper>
          <AddEvent />
        </Wrapper>
      )
    }
    {
      (view === views.EVENT_DETAILS)
      && (
        <Wrapper>
          <EventDetails />
        </Wrapper>
      )
    }
    {
      (view === views.EDIT_EVENT)
      && (
        <Wrapper>
          <EditEvent />
        </Wrapper>
      )
    }
  </div>
);

PureCalendar.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  navigationHistory: PropTypes.array.isRequired,
  view: PropTypes.oneOf(Object.values(views)).isRequired,
};

const Calendar = calendarContainer(PureCalendar);

class CalendarRoot extends React.Component {
  constructor(props) {
    super(props);

    // store.dispatch(registerCalendar(props.calendarId));
  }
  render() {
    return (
      <Provider store={store}>
        <Calendar />
      </Provider>
    );
  }
}

export default CalendarRoot;
