/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { connect } from 'react-redux';
import {
  compose,
  withHandlers,
  withState,
  withPropsOnChange,
} from 'recompose';
import PropTypes from 'prop-types';
import moment from 'moment';
import { views } from '../store/constants';
import {
  searchEvents,
} from '../store/reductions';
// assets
import SearchIcon from '../svg/search.svg';
// selectors
import {
  selectEvents,
  selectEventsByMonth,
  selectEventsInYear,
  sortEvents,
  selectCursor,
} from '../store/selectors';
// actions
import {
  setSelectedEvent,
  setView,
} from '../store/actions';
// components
import RoundedBox from './RoundedBox';
import AddEventButton from './AddEventButton';

const displayEventDuration = (start, end, date) => {
  if (date.isBetween(start, end, 'day')) {
    return 'All day';
  }

  if (date.isSame(start, 'day') && end.isAfter(start, 'day')) {
    return `${start.format('h:mmA')} - 11:59PM`;
  }

  if (date.isSame(end, 'day') && end.isAfter(start, 'day')) {
    return `12:00AM - ${end.format('h:mmA')}`;
  }

  if (
    start.format('h:mmA') === '12:00AM'
    && end.format('h:mmA') === '11:59PM'
  ) return 'All day';

  return `${start.format('h:mmA')} - ${end.format('h:mmA')}`;
};

const Event = ({
  // state
  e,
  index,
  // actions
  onClick,
}) => (
  <div
    onClick={onClick}
    css={css`
      transition: background-color 200ms ease;
      display: flex; height: 65px; border-bottom: 1px solid #eee;
      cursor: pointer;

      &:hover {
        background-color: #f9f9f9;
      }

      &:last-child {
        border-bottom: none;
      }
    `}
  >
    <div
      css={css`
        display: flex; flex-direction: column; justify-content: center; align-items: center; width: 45px;
      `}
    >
      <h5
        css={css`
          margin: 0 0 2px;
          font-size: 18px; font-weight: 500;
        `}
      >
        {e.start.clone().add(index, 'days').date()}
      </h5>
      <h6
        css={css`
          margin: 0;
          font-weight: 400;
          color: #888;
        `}
      >
        {e.start.clone().add(index, 'days').format('ddd')}
      </h6>
    </div>
    <div
      css={css`
        display: flex; flex-direction: column; justify-content: center;
      `}
    >
      <h3
        css={css`
          margin: 0 0 5px;
          font-size: 16px; font-weight: 500;
        `}
      >
        {e.name}
      </h3>
      <h5
        css={css`
          margin: 0;
          font-weight: 400;
          color: #9E9E9E;
        `}
      >
        {
          displayEventDuration(
            e.start,
            e.end,
            e.start.clone().add(index, 'days'),
          )
        }
        {
          e.location
          && ` | ${e.location}`
        }
      </h5>
    </div>
  </div>
);

Event.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  e: PropTypes.any.isRequired,
  index: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
};

const EventList = ({
  // state
  yearsToDisplay,
  events,
  // actions
  handleShowEventsFromYear,
}) => (
  <div
    css={css`
      padding: 15px; flex: 1; overflow-y: auto;
    `}
  >
    {
      // !!Object.keys(events).length
      // && (
      //   <div
      //     css={css`
      //       display: flex; align-items: center; justify-content: center; height: 35px;
      //     `}
      //     onClick={() => handleShowEventsFromYear(moment(yearsToDisplay[0], 'YYYY').subtract(1, 'year').format('YYYY'))}
      //   >
      //     <div
      //       css={css`
      //         font-size: 13px;
      //         color: #333;
      //         cursor: pointer;
      //         user-select: none;
      //       `}
      //     >
      //       {`Show events from ${moment(yearsToDisplay[0], 'YYYY').subtract(1, 'year').format('YYYY')}`}
      //     </div>
      //   </div>
      // )
    }
    {
      Object.keys(events).map((month) => (
        (events[month].length || null)
        && (
          <EventGroup
            key={month}
            label={moment(month).format('MMMM YYYY')}
            events={events[month]}
          />
        )
      ))
    }
  </div>
);

EventList.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  events: PropTypes.object.isRequired,
};

const EventGroup = connect(
  null,
  (dispatch) => ({
    navigateToEvent: (e) => {
      dispatch(setSelectedEvent(e));
      dispatch(setView(views.EVENT_DETAILS));
    },
  }),
)(({
  // state
  label,
  events,
  // actions
  navigateToEvent,
}) => (
  <RoundedBox
    css={css`
      margin-bottom: 10px;
    `}
  >
    <h3
      css={css`
        margin: 0;
        padding-bottom: 10px; border-bottom: 1px solid #eee;
        font-size: 14px; font-weight: 400;
        color: #47A6EA;
      `}
    >
      {label}
    </h3>
    <div>
      {
        events.reduce((acc, e) => {
          const eventInstances = [];
          const diff = e.end.diff(e.start, 'days');
          for (let i = 0; i <= diff; i++) {
            eventInstances.push((
              <Event
                e={e}
                key={e.id + i}
                index={i}
                onClick={() => navigateToEvent(e)}
              />
            ));
          }
          return acc.concat(eventInstances);
        }, [])
      }
    </div>
  </RoundedBox>
));

export const PureEvents = ({
  // state
  filteredEvents,
  cursor,
  state: {
    yearsToDisplay,
  },
  // actions
  handleSearch,
  handleShowEventsFromYear,
}) => (
  <div
    css={css`
      display: flex; flex-direction: column; height: 100%;
    `}
  >
    <div
      css={css`
        position: relative; margin: 0 15px 15px;
        height: 40px;
      `}
    >
      <SearchIcon
        css={css`
          position: absolute; top: 50%; left: 14px; transform: translate(0, -50%);
          height: 14px; width: 14px;
        `}
      />
      <input
        type="text"
        onChange={handleSearch}
        css={css`
          margin: 0;
          display: block; width: 100%; padding: 0 15px 0 38px; height: 100%; border: none;
          background-color: #e6e6e6; border-radius: 6px;
          &:focus {
            outline: none;
          }
        `}
      />
    </div>
    <EventList
      yearsToDisplay={yearsToDisplay}
      events={filteredEvents}
      handleShowEventsFromYear={handleShowEventsFromYear}
    />
    <AddEventButton />
  </div>
);

PureEvents.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  filteredEvents: PropTypes.object.isRequired,
  handleSearch: PropTypes.func.isRequired,
};

export const eventsContainer = compose(
  connect(
    (state) => ({
      events: selectEvents(state),
      cursor: selectCursor(state),
    }),
  ),
  withState('state', 'setState', ({ cursor }) => ({
    keyword: '',
    cursor,
    yearsToDisplay: [ cursor.format('YYYY') ],
  })),
  withPropsOnChange(
    ['state', 'events'],
    ({
      state: {
        keyword,
        cursor,
        yearsToDisplay,
      },
      events,
    }) => {
      const eventsByMonth = selectEventsByMonth(
        sortEvents(
          selectEventsInYear(
            events,
            yearsToDisplay,
          ),
        ),
      );
      const filteredEvents = { ...eventsByMonth };
      for (const month in filteredEvents) {
        if (Object.prototype.hasOwnProperty.call(filteredEvents, month)) {
          filteredEvents[month] = searchEvents(filteredEvents[month], keyword);
        }
      }

      return { filteredEvents };
    },
  ),
  withHandlers({
    handleSearch: ({
      state,
      setState,
    }) => (e) => setState({
      ...state,
      keyword: e.target.value,
    }),
    handleShowEventsFromYear: ({
      state,
      setState,
    }) => (year) => setState({
      ...state,
      yearsToDisplay: state.yearsToDisplay.concat([ year ]).sort(),
    }),
  }),
);

export default eventsContainer(PureEvents);

