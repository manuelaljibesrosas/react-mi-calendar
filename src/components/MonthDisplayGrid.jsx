/** @jsx jsx */
import { jsx, css, keyframes } from '@emotion/core';
import { connect } from 'react-redux';
import {
  compose,
  mapProps,
  lifecycle,
} from 'recompose';
import PropTypes from 'prop-types';
import {
  getDate,
  getDay,
  setDate,
  add,
  sub,
  format,
  isSameMonth,
} from 'date-fns/fp';
import { navigationOrientations } from '../store/constants';
// selectors
import {
  selectNavigationOrientation,
  selectCursor,
  selectEventsInMonth,
  selectEvents,
} from '../store/selectors';
// actions
import {
  navigateLeft,
  navigateRight,
} from '../store/actions';
// components
import ChevronLeft from '../svg/chevron-left.svg';
import ChevronRight from '../svg/chevron-right.svg';
import TypeFace2 from './TypeFace2';
import CalendarDayCell from './CalendarDayCell';

// const translateFromRight = keyframes`
//   from {
//     transform: translate3d(100%, 0, 0);
//     z-index: ${(Math.random() * 100).toFixed(0)}
//   }
//   to {
//     transform: translate3d(0, 0, 0);
//     z-index: ${(Math.random() * 100).toFixed(0)}
//   }
// `;

// const translateFromLeft = keyframes`
//   from {
//     transform: translate3d(-100%, 0, 0);
//   }
//   to {
//     transform: translate3d(0, 0, 0);
//   }
// `;

// z-index hack to make emotion think the animation is
// different and update on every prop change
const getAnimation = (orientation) => {
  if (orientation === navigationOrientations.NONE) return;

  if (orientation === navigationOrientations.RIGHT) {
    return keyframes`
      from {
        transform: translate3d(100%, 0, 0);
        z-index: ${(Math.random() * 100).toFixed(0)}
      }
      to {
        transform: translate3d(0, 0, 0);
        z-index: ${(Math.random() * 100).toFixed(0)}
      }
    `;
  }

  return keyframes`
    from {
      transform: translate3d(-100%, 0, 0);
      z-index: ${(Math.random() * 100).toFixed(0)}
    }
    to {
      transform: translate3d(0, 0, 0);
      z-index: ${(Math.random() * 100).toFixed(0)}
    }
  `;
};

const getRangeOfVisibleDaysFromPreviousMonth = (m) => {
  const firstDayOfMonth = setDate(1)(m);

  const daysOfPreviousMonth = [];

  for (let i = getDay()(firstDayOfMonth); i > 0; i--) {
    daysOfPreviousMonth.push(compose(getDate(), sub({ days: i }))(firstDayOfMonth));
  }

  return daysOfPreviousMonth.sort();
};

const getRangeOfVisibleDaysFromNextMonth = (m) => {
  const dayIndex = compose(getDay(), setDate(0), add({ months: 1 }));

  if (dayIndex === 6) return [];

  // eslint-disable-next-line prefer-spread
  return Array.apply(null, { length: (6 - dayIndex) }).map(Number.call, Number);
};

const monthLabel = css`
  place-self: center;
  user-select: none;
`;

const innerCalendarContainer = compose(
  connect(
    (state) => ({
      events: selectEvents(state),
    }),
    (dispatch) => ({
      navigateLeft: () => dispatch(navigateLeft()),
      navigateRight: () => dispatch(navigateRight()),
    }),
  ),
  mapProps((props) => {
    const eventsInMonth = selectEventsInMonth(props.events, props.cursor);
    const datesThatHaveEvent = eventsInMonth.reduce((acc, cur) => {
      let i = Number(format('dd')(cur.start));
      while (i <= Number(format('dd')(cur.end))) {
        acc.push(i);
        i++;
      }
      return acc;
    }, []);

    return {
      ...props,
      datesThatHaveEvent,
    };
  }),
  lifecycle({
    shouldComponentUpdate(nextProps) {
      if (
        !isSameMonth(nextProps.cursor)(this.props.cursor)
        || this.props.datesThatHaveEvent.length !== nextProps.datesThatHaveEvent
      ) {
        return true;
      }

      return false;
    },
  }),
);

const PureInnerCalendar = ({
  cursor,
  navigateLeft,
  navigateRight,
  datesThatHaveEvent,
}) => (
  <div
    css={css`
      display: grid; grid-template-columns: repeat(7, auto);
      grid-template-rows: 30px; height: 100%; place-items: stretch;
    `}
  >
    <div css={monthLabel}>
      <TypeFace2 size="10px">Sun</TypeFace2>
    </div>
    <div css={monthLabel}>
      <TypeFace2 size="10px">Mon</TypeFace2>
    </div>
    <div css={monthLabel}>
      <TypeFace2 size="10px">Tue</TypeFace2>
    </div>
    <div css={monthLabel}>
      <TypeFace2 size="10px">Wed</TypeFace2>
    </div>
    <div css={monthLabel}>
      <TypeFace2 size="10px">Thu</TypeFace2>
    </div>
    <div css={monthLabel}>
      <TypeFace2 size="10px">Fri</TypeFace2>
    </div>
    <div css={monthLabel}>
      <TypeFace2 size="10px">Sat</TypeFace2>
    </div>
    {
      getRangeOfVisibleDaysFromPreviousMonth(cursor).map((day) => (
        <CalendarDayCell
          key={`prevMonth-${day}`}
          date={compose(setDate(day), sub({ months: 1 }))(cursor)}
          dimmed
          onClick={navigateLeft}
        />
      ))
    }
    {
      // eslint-disable-next-line prefer-spread
      Array.apply(null, { length: compose(getDate(), setDate(0), add({ months: 1 }))(cursor) })
        .map((_, index) => index + 1)
        .map((day) => (
          <CalendarDayCell
            key={day}
            date={setDate(day)(cursor)}
            hasEvent={datesThatHaveEvent.includes(day)}
          />
        ))
    }
    {
      getRangeOfVisibleDaysFromNextMonth(cursor)
        .map((val) => val + 1)
        .map((day) => (
          <CalendarDayCell
            key={`nextMonth-${day}`}
            date={compose(setDate(day), add({ months: 1 }))(cursor)}
            dimmed
            onClick={navigateRight}
          />
        ))
    }
  </div>
);

PureInnerCalendar.propTypes = {
  cursor: PropTypes.instanceOf(Date).isRequired,
  navigateLeft: PropTypes.func.isRequired,
  navigateRight: PropTypes.func.isRequired,
};

const InnerCalendar = innerCalendarContainer(PureInnerCalendar);

const monthDisplayGridContainer = connect(
  (state) => ({
    cursor: selectCursor(state),
    navigationOrientation: selectNavigationOrientation(state),
  }),
  (dispatch) => ({
    navigateLeft: () => dispatch(navigateLeft()),
    navigateRight: () => dispatch(navigateRight()),
  }),
);

const PureMonthDisplayGrid = ({
  // state
  cursor,
  // if the cursor moved to the next month, this prop should
  // be set to 'RIGHT', and we should render two InnerCalendars
  // one for the previous month, and another for the new month,
  // then, we use this prop to assign an animation to the
  // wrapper that will animate from transform: translateX(-100%)
  // to transform: translateX(0)
  navigationOrientation,
  // actions
  navigateLeft,
  navigateRight,
}) => (
  <div>
    <div
      css={css`
        display: flex; justify-content: space-between; padding: 0 15px; height: 35px; align-items: center;
      `}
    >
      <div
        css={css`
          width: 10px; height: 20px;
          cursor: pointer;
        `}
        onClick={navigateLeft}
      >
        <ChevronLeft
          css={css`
            width: 100%; height: 100%;
          `}
        />
      </div>
      <div
        css={css`
          width: 10px; height: 20px;
          cursor: pointer;
        `}
        onClick={navigateRight}
      >
        <ChevronRight
          css={css`
            width: 100%; height: 100%;
          `}
        />
      </div>
    </div>
    <div
      css={css`
        animation: ${getAnimation(navigationOrientation)} 200ms linear;
        position: relative; margin-bottom: 25px;
      `}
    >
      {
        navigationOrientation === navigationOrientations.RIGHT
        && (
          <div
            key={compose(format('yyyy-MM-dd'), sub({ months: 1 }))(cursor)}
            css={css`
              position: absolute; top: 0; left: 0;
              transform: translateX(-100%);
              height: 100%; width: 100%;
            `}
          >
            <InnerCalendar
              cursor={sub({ months: 1 })(cursor)}
            />
          </div>
        )
      }
      <div
        key={format('yyyy-MM-dd')(cursor)}
        css={css`
          height: 100%; width: 100%;
        `}
      >
        <InnerCalendar
          cursor={cursor}
        />
      </div>
      {
        navigationOrientation === navigationOrientations.LEFT
        && (
          <div
            key={compose(format('yyyy-MM-dd'), add({ months: 1 }))(cursor)}
            css={css`
              position: absolute; top: 0; left: 0;
              transform: translateX(100%);
              height: 100%; width: 100%;
            `}
          >
            <InnerCalendar
              cursor={add({ months: 1 })(cursor)}
            />
          </div>
        )
      }
    </div>
  </div>
);

PureMonthDisplayGrid.propTypes = {
  cursor: PropTypes.instanceOf(Date).isRequired,
  navigationOrientation: PropTypes.oneOf(Object.values(navigationOrientations)).isRequired,
  navigateLeft: PropTypes.func.isRequired,
  navigateRight: PropTypes.func.isRequired,
};

const MonthDisplayGrid = monthDisplayGridContainer(PureMonthDisplayGrid);

export default MonthDisplayGrid;
