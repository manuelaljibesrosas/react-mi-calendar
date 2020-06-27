/** @jsx jsx */
import React from 'react';
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
  setDate,
} from 'date-fns/fp';
import Hammer from 'hammerjs';
import PropTypes from 'prop-types';
import { views } from '../store/constants';
import {
  searchEvents,
  sortEvents,
} from '../store/utils';
import {
  easings,
  tween,
} from '../store/animations';
// selectors
import {
  selectEvents,
  selectEventsByMonth,
  selectEventsInYear,
  selectCursor,
  selectSearchKeyword,
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

const eventContainer = connect(
  null,
  (dispatch, ownProps) => ({
    onClick: () => {
      dispatch(setSelectedEvent(ownProps.e));
      dispatch(push(views.EVENT_DETAILS));
    },
  }),
);

const PureEvent = ({
  // state
  e,
  date,
  // actions
  onClick,
}) => (
  <div
    css={css`
      display: flex; flex-direction: column; justify-content: center;
      padding: 10px 0; border-bottom: 1px solid #eee;
      cursor: pointer;

      &:last-child {
        border-bottom: none;
      }
    `}
    onClick={onClick}
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
          // add({ days: index })(e.start),
          date,
        )
      }
      {
        e.location
        && ` | ${e.location}`
      }
    </h5>
  </div>
);

PureEvent.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  e: PropTypes.any.isRequired,
  date: PropTypes.instanceOf(Date),
  onClick: PropTypes.func.isRequired,
};

const Event = eventContainer(PureEvent);

const EventList = ({
  // state
  yearsToDisplay,
  events,
  // actions
  handleShowEventsFromYear,
}) => (
  <div
    css={css`
      padding: 15px; height: 1000px;

      @media (min-width: 421px) {
        margin: 0 20px;
      }
    `}
  >
    {
      Object.keys(events).map((month) => (
        <EventGroup
          key={month}
          monthLabelDate={new Date(month.split('-')[0], month.split('-')[1])}
          events={events[month]}
        />
      ))
    }
  </div>
);

EventList.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  events: PropTypes.object.isRequired,
};

const EventDateSection = ({
  date,
  events,
}) => (
  <div
    css={css`
      transition: background-color 200ms ease;
      display: flex; min-height: 65px; border-bottom: 1px solid #eee;
      align-items: center;

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
        display: flex; flex-direction: column; justify-content: center;
        align-items: center; width: 45px; align-self: baseline;
        padding: 10px 0;
      `}
    >
      <h5
        css={css`
          margin: 0 0 2px;
          font-size: 18px; font-weight: 500;
        `}
      >
        {date.getDate()}
      </h5>
      <h6
        css={css`
          margin: 0;
          font-weight: 400;
          color: #888;
        `}
      >
        {format('ccc')(date)}
      </h6>
    </div>
    <div
      css={css`
        flex: 1;
      `}
    >
      {
        events.map((e) => (
          <Event
            e={e}
            key={e.id + date.getDate()}
            date={date}
          />
        ))
      }
    </div>
  </div>
);

const EventGroup = ({
  // state
  monthLabelDate,
  events,
  // actions
  navigateToEvent,
}) => (
  <RoundedBox
    css={css`
      margin-bottom: 20px;
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
      {format('MMMM yyyy')(monthLabelDate)}
    </h3>
    <div>
      {
        events.reduce((acc, cur, idx) => {
          if (!cur) {
            return acc;
          }
          return acc.concat(
            <EventDateSection
              key={idx}
              events={cur}
              date={setDate(idx)(monthLabelDate)}
            />
          );
        }, [])
      }
    </div>
  </RoundedBox>
);

export const eventsContainer = compose(
  connect(
    (state) => ({
      events: selectEvents(state),
      cursor: selectCursor(state),
      keyword: selectSearchKeyword(state),
    }),
  ),
  // withState('state', 'setState', ({ cursor }) => ({
  //   keyword: '',
  //   cursor,
  //   yearsToDisplay: [format('yyyy')(cursor)],
  // })),
  withPropsOnChange(
    // ['state', 'events'],
    ['events', 'keyword'],
    ({
      keyword,
      events,
    }) => {
      const filteredEvents = selectEventsByMonth(events);

      for (const month in filteredEvents) {
        filteredEvents[month] = filteredEvents[month].map((date) => {
          if (!date) {
            return date;
          }
          const ret = searchEvents(date, keyword);

          if (!ret.length) {
            return null;
          }
          return ret;
        });
      }

      return { filteredEvents };
    },
  ),
  withHandlers({
    // handleShowEventsFromYear: ({
    //   state,
    //   setState,
    // }) => (year) => setState({
    //   ...state,
    //   yearsToDisplay: state.yearsToDisplay.concat([year]).sort(),
    // }),
  }),
);

class Events extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      yearsToDisplay: [format('yyyy')(props.cursor)],
    };
    this.ref = React.createRef();
  }

  componentDidMount() {
    const refHeight = this.ref.current.clientHeight;
    const scrollableContentHeight = this.ref.current.firstChild.clientHeight;
    const scroller = this.ref.current;
    const scrollerTracker = {
      value: 0,
      distanceTraveledSinceLastBecameZero: 0,
    };
    let translateOffset = 0;
    const directionTracker = {
      direction: 0,
      offset: 0,
    };
    const manager = new Hammer.Manager(this.ref.current);
    const pan = new Hammer.Pan({
      direction: Hammer.DIRECTION_VERTICAL, 
    });
    manager.add(pan);
    manager.on('panstart', (e) => {
      scrollerTracker.value = scroller.scrollTop;
      directionTracker.direction = e.direction;
    });
    manager.on('panmove', (e) => {
      if (e.direction === Hammer.DIRECTION_UP || e.direction === Hammer.DIRECTION_DOWN) {
        if (directionTracker.direction !== e.direction) {
          directionTracker.direction = e.direction;
          directionTracker.offset = e.deltaY;
        }
      }

      const distanceTraveledSinceChangedDirection = (
        Math.abs(directionTracker.offset - e.deltaY)
      );
      const scrollPosition = (
        // prevent scroll value to go beyond what can be scrolled
        Math.min(
          Math.max(scrollerTracker.value - e.velocityY * 5, 0),
          scrollableContentHeight - refHeight,
        )
      );
      if (scrollerTracker.value > 0 && scrollPosition === 0) {
        scrollerTracker.distanceTraveledSinceLastBecameZero = (
          distanceTraveledSinceChangedDirection
        );
      }

      // UP
      if (directionTracker.direction === Hammer.DIRECTION_UP) {
        if (translateOffset > 0) {
          translateOffset = translateOffset - Math.abs(e.velocityY) * 5;
 
          this.ref.current.style.transform = `translateY(${translateOffset}px)`;
        } else {
          scroller.scrollTop = scrollerTracker.value = scrollPosition;
        }
      }
      // DOWN
      else if (directionTracker.direction === Hammer.DIRECTION_DOWN) {
        if (scrollerTracker.value === 0) {
          translateOffset = Math.min(translateOffset + Math.abs(e.velocityY) * 5, 50);
 
          this.ref.current.style.transform = `translateY(${translateOffset}px)`;
        } else {
          scroller.scrollTop = scrollerTracker.value = scrollPosition;
        }
      }
    });
    manager.on('panend', (e) => {
      if (translateOffset > 0) {
       tween({
         from: translateOffset,
         to: 0,
         duration: 200,
         onUpdate: (value) => {
           this.ref.current.style.transform = `translateY(${value}px)`;
         },
         onComplete: () => {
           translateOffset = scrollerTracker.distanceTraveledSinceLastBecameZero = 0;
         },
       });
      }
    });
  }

  render() {
    const {
      // state
      filteredEvents,
      // actions
      handleSearch,
      handleShowEventsFromYear,
    } = this.props;

    return (
      <div
        ref={this.ref}
        css={css`
          height: 100%; overflow-y: auto;
        `}
      >
        <EventList
          // TODO: fix 
          yearsToDisplay={[]}
          events={filteredEvents}
          handleShowEventsFromYear={handleShowEventsFromYear}
        />
      </div>
    );
  }
}

Events.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  filteredEvents: PropTypes.object.isRequired,
};

export default eventsContainer(Events);

