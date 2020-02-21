/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { connect } from 'react-redux';
import {
  compose,
  withHandlers,
  withState,
  withPropsOnChange,
} from 'recompose';
import {
  isWithinInterval,
  format,
  differenceInDays,
  add,
  isSameDay,
  isAfter,
  getDate,
} from 'date-fns/fp';
import PropTypes from 'prop-types';
import { views } from '../store/constants';
import {
  searchEvents,
  sortEvents,
} from '../store/utils';
// assets
import SearchIcon from '../svg/search.svg';
// selectors
import {
  selectEvents,
  selectEventsByMonth,
  selectEventsInYear,
  selectCursor,
} from '../store/selectors';
// actions
import { setSelectedEvent } from '../store/actions';
import { push } from 'connected-react-router';
// components
import RoundedBox from './RoundedBox';
import AddEventButton from './AddEventButton';

const displayEventDuration = (start, end, date) => {
  // TODO: isBetween 'day'
  if (isWithinInterval({ start, end })(date)) {
    return 'All day';
  }

  // TODO: isAfter 'day'
  if (isSameDay(start)(date) && isAfter(start)(end)) {
    return `${format('h:mma')(start)} - 11:59PM`;
  }

  // TODO: isAfter 'day'
  if (isSameDay(end)(date) && isAfter(start)(end)) {
    return `12:00AM - ${format(end, 'h:mma')}`;
  }

  if (
    format('h:mma')(start) === '12:00AM'
    && format('h:mma')(end) === '11:59PM'
  ) return 'All day';

  return `${format('h:mma')(start)} - ${format('h:mma')(end)}`;
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
        {compose(getDate(), add({ days: index }))(e.start)}
      </h5>
      <h6
        css={css`
          margin: 0;
          font-weight: 400;
          color: #888;
        `}
      >
        {compose(format('ccc'), add({ days: index }))(e.start)}
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
            add({ days: index })(e.start),
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
      Object.keys(events).map((month) => (
        (events[month].length || null)
        && (
          <EventGroup
            key={month}
            label={format('MMMM yyyy')(new Date(month.split('-')[0], month.split('-')[1]))}
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

const eventGroupContainer = connect(
  null,
  (dispatch) => ({
    navigateToEvent: (e) => {
      dispatch(setSelectedEvent(e));
      dispatch(push(views.EVENT_DETAILS));
    },
  }),
);

const PureEventGroup = ({
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
          const diff = differenceInDays(e.start)(e.end);
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
);

const EventGroup = eventGroupContainer(PureEventGroup);

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
    yearsToDisplay: [format('yyyy')(cursor)],
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
      yearsToDisplay: state.yearsToDisplay.concat([year]).sort(),
    }),
  }),
);

export default eventsContainer(PureEvents);
