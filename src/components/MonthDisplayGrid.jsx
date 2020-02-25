/** @jsx jsx */
import React from 'react';
import { jsx, css } from '@emotion/core';
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
import {
  easings,
  tween,
} from '../store/animations';
import Hammer from 'hammerjs';
import {
  animationStore,
  animationStatus,
  navigate,
} from '../store/animationStore';
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

const getRangeOfVisibleDaysFromPreviousMonth = (m) => {
  const firstDayOfMonth = setDate(1)(m);

  const daysOfPreviousMonth = [];

  for (let i = getDay()(firstDayOfMonth); i > 0; i--) {
    daysOfPreviousMonth.push(compose(getDate(), sub({ days: i }))(firstDayOfMonth));
  }

  return daysOfPreviousMonth.sort();
};

const getRangeOfVisibleDaysFromNextMonth = (m) => {
  const dayIndex = compose(getDay(), setDate(0), add({ months: 1 }))(m);

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

class MonthDisplayGrid extends React.Component {
  constructor(props) {
    super(props);

    this.isAnimating = false;
    this.ref = React.createRef();

    this.animate = this.animate.bind(this);
  }

  animate(orientation, from = 0, easing = easings.EASE_OUT) {
    if (
      orientation === navigationOrientations.NONE
      || typeof orientation === 'undefined'
      || this.isAnimating
    ) return;

    this.isAnimating = true;

    if (orientation === navigationOrientations.RIGHT) {
      tween({
        from,
        to: -100,
        duration: 200,
        easing,
        onUpdate: (value) => {
          animationStore.dispatch(navigate({
            status: animationStatus.TICK,
            value
          }));
        },
        onComplete: () => {
          this.isAnimating = false;
          this.props.navigateRight();
          animationStore.dispatch(navigate({
            status: animationStatus.COMPLETE,
            value: 0,
          }));
        },
      });
    }

    if (orientation === navigationOrientations.LEFT) {
      tween({
        from,
        to: 100,
        duration: 200,
        easing,
        onUpdate: (value) => {
          animationStore.dispatch(navigate({
            status: animationStatus.TICK,
            value
          }));
        },
        onComplete: () => {
          this.isAnimating = false;
          this.props.navigateLeft();
          animationStore.dispatch(navigate({
            status: animationStatus.COMPLETE,
            value: 0,
          }));
        },
      });
    }
  };

  componentDidMount() {
    const refWidth = this.ref.current.clientWidth;
    const manager = new Hammer.Manager(this.ref.current);
    const pan = new Hammer.Pan();
    manager.add(pan);
    manager.on('panstart panmove', (e) => {
      animationStore.dispatch(navigate({
        status: animationStatus.TICK,
        value: Math.max(Math.min(e.deltaX / refWidth, 1), -1) * 100,
      }));
    });
    manager.on('panend', (e) => {
      // swipe
      if (Math.abs(e.velocityX) > .5 && Math.abs(e.deltaX) > 90) {
        if (e.deltaX > 0) {
          this.animate(navigationOrientations.LEFT, Math.max(Math.min(e.deltaX / refWidth, 1), -1) * 100, easings.LINEAR);
        } else {
          this.animate(navigationOrientations.RIGHT, Math.max(Math.min(e.deltaX / refWidth, 1), -1) * 100, easings.LINEAR);
        }
      }
      // panned more than 75% of the total width of the block
      else if (Math.abs(Math.max(Math.min(e.deltaX / refWidth, 1), -1)) > .5) {
        if (e.deltaX > 0) {
          this.animate(navigationOrientations.LEFT, Math.max(Math.min(e.deltaX / refWidth, 1), -1) * 100, easings.LINEAR);
        } else {
          this.animate(navigationOrientations.RIGHT, Math.max(Math.min(e.deltaX / refWidth, 1), -1) * 100, easings.LINEAR);
        }
      }
      // pan was too subtle to trigger navigation
      else {
        this.isAnimating = true;
        tween({
          from: Math.max(Math.min(e.deltaX / refWidth, 1), -1) * 100,
          to: 0,
          duration: 200,
          onUpdate: (value) => {
            animationStore.dispatch(navigate({
              status: animationStatus.TICK,
              value
            }));
          },
          onComplete: () => {
            this.isAnimating = false;
            animationStore.dispatch(navigate({
              status: animationStatus.COMPLETE,
              value: 0,
            }));
          },
        });
      }
    });

    animationStore.subscribe(() => {
      const { navigation } = animationStore.getState();

      if (navigation.status === animationStatus.TICK) {
        this.ref.current.style.transform = `translateX(${navigation.value}%)`;
      } else if (navigation.status === animationStatus.COMPLETE) {
        this.ref.current.style.transform = 'translateX(0)';
      }
    });
  }

  render() {
    const {
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
      // navigateLeft,
      // navigateRight,
    } = this.props;

    return (
      <div>
        <div
          css={css`
            margin: 8px 0;
            display: flex; justify-content: space-between; padding: 0 15px;
            height: 8px; align-items: center;
          `}
        >
          <div
            css={css`
              width: 10px; height: 20px;
              cursor: pointer;
            `}
            onClick={() => this.animate(navigationOrientations.LEFT)}
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
            onClick={() => this.animate(navigationOrientations.RIGHT)}
          >
            <ChevronRight
              css={css`
                width: 100%; height: 100%;
              `}
            />
          </div>
        </div>
        <div
          ref={this.ref}
          css={css`
            will-change: transform;
            position: relative; margin-bottom: 25px;
          `}
        >
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
        </div>
      </div>
    );
  }
}

MonthDisplayGrid.propTypes = {
  cursor: PropTypes.instanceOf(Date).isRequired,
  navigationOrientation: PropTypes.oneOf(Object.values(navigationOrientations)).isRequired,
  navigateLeft: PropTypes.func.isRequired,
  navigateRight: PropTypes.func.isRequired,
};

const ConnectedMonthDisplayGrid = monthDisplayGridContainer(MonthDisplayGrid);

export default ConnectedMonthDisplayGrid;
