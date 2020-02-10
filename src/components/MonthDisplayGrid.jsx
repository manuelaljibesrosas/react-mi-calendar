/** @jsx jsx */
import { jsx, css, keyframes } from '@emotion/core';
import { connect } from 'react-redux';
import {
  compose,
  mapProps,
  lifecycle,
} from 'recompose';
import PropTypes from 'prop-types';
import moment from 'moment';
import { navigationOrientations } from '../store/constants';
// selectors
import {
  selectNavigationOrientation,
  selectCursor,
  selectEventsByMonth,
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
import CalendarDateCell from './CalendarDayCell';

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
  const firstDayOfMonth = m.clone().date(1);

  const daysOfPreviousMonth = [];

  for (let i = firstDayOfMonth.day(); i > 0; i--) {
    daysOfPreviousMonth.push(firstDayOfMonth.subtract(1, 'day').date());
  }

  return daysOfPreviousMonth.sort();
};

const getRangeOfVisibleDaysFromNextMonth = (m) => {
  const dayIndex = m.clone().add(1, 'month').date(0).day();

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
      eventsByMonth: selectEventsByMonth(selectEvents(state)),
    }),
    (dispatch) => ({
      navigateLeft: () => dispatch(navigateLeft()),
      navigateRight: () => dispatch(navigateRight()),
    }),
  ),
  mapProps((props) => {
    let datesThatHaveEvent = [];
    const month = Object.keys(props.eventsByMonth).filter(m => (
      moment(m, 'YYYY-MM-DD').isSame(props.cursor, 'month')
    ));
    if (month.length) {
      datesThatHaveEvent = props.eventsByMonth[month].reduce((acc, cur) => {
        let i = Number(cur.start.format('DD'));
        while (i <= cur.end.format('DD')) {
          acc.push(i);
          i++;
        }
        return acc;
      }, []);
    }
    return {
      ...props,
      datesThatHaveEvent,
    };
  }),
  lifecycle({
    shouldComponentUpdate(nextProps) {
      if (
        !this.props.cursor.isSame(nextProps.cursor, 'month')
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
        <CalendarDateCell
          key={`prevMonth-${day}`}
          date={cursor.clone().subtract(1, 'month').date(day)}
          dimmed
          onClick={navigateLeft}
        />
      ))
    }
    {
      // eslint-disable-next-line prefer-spread
      Array.apply(null, { length: cursor.clone().add(1, 'month').date(0).date() })
        .map((_, index) => index + 1)
        .map((day) => (
          <CalendarDateCell
            key={day}
            date={cursor.clone().date(day)}
            hasEvent={datesThatHaveEvent.includes(day)}
          />
        ))
    }
    {
      getRangeOfVisibleDaysFromNextMonth(cursor)
        .map((val) => val + 1)
        .map((day) => (
          <CalendarDateCell
            key={`nextMonth-${day}`}
            date={cursor.clone().add(1, 'month').date(day)}
            dimmed
            onClick={navigateRight}
          />
        ))
    }
  </div>
);

PureInnerCalendar.propTypes = {
  cursor: PropTypes.instanceOf(moment).isRequired,
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
            key={cursor.clone().subtract(1, 'month').format('YYYY-MM-DD')}
            css={css`
              position: absolute; top: 0; left: 0;
              transform: translateX(-100%);
              height: 100%; width: 100%;
            `}
          >
            <InnerCalendar
              cursor={cursor.clone().subtract(1, 'month')}
            />
          </div>
        )
      }
      <div
        key={cursor.clone().format('YYYY-MM-DD')}
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
            key={cursor.clone().add(1, 'month').format('YYYY-MM-DD')}
            css={css`
              position: absolute; top: 0; left: 0;
              transform: translateX(100%);
              height: 100%; width: 100%;
            `}
          >
            <InnerCalendar
              cursor={cursor.clone().add(1, 'month')}
            />
          </div>
        )
      }
    </div>
  </div>
);

PureMonthDisplayGrid.propTypes = {
  cursor: PropTypes.instanceOf(moment).isRequired,
  navigationOrientation: PropTypes.oneOf(Object.values(navigationOrientations)).isRequired,
  navigateLeft: PropTypes.func.isRequired,
  navigateRight: PropTypes.func.isRequired,
};

const MonthDisplayGrid = monthDisplayGridContainer(PureMonthDisplayGrid);

export default MonthDisplayGrid;
