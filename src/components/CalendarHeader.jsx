/** @jsx jsx */
import { jsx, css, keyframes } from '@emotion/core';
import { connect } from 'react-redux';
import {
  compose,
  withHandlers,
  withPropsOnChange,
} from 'recompose';
import PropTypes from 'prop-types';
import {
  navigationOrientations,
  views,
} from '../store/constants';
// assets
import EventsIcon from '../svg/events.svg';
import CalendarIcon from '../svg/calendar.svg';
// selectors
import {
  selectView,
  selectCursor,
  selectNavigationOrientation,
} from '../store/selectors';
// actions
import { setView } from '../store/actions';

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

export const calendarHeaderIconContainer = compose(
  connect(
    (state) => ({
      view: selectView(state),
    }),
    { setView }
  ),
  withHandlers(({
    toggleEventsView: ({
      view,
      setView,
    }) => () => {
      if (view === views.CALENDAR) {
        setView(views.EVENTS);
      } else {
        setView(views.CALENDAR);
      }
    },
  })),
);

export const PureCalendarHeaderIcon = ({
  // state
  view,
  // actions
  toggleEventsView,
}) => (
  <div
    css={css`
      cursor: pointer;
      width: 20px; height: 20px;
    `}
    onClick={toggleEventsView}
  >
    {
      view === views.CALENDAR
      && (
        <EventsIcon
          css={css`
            width: 100%; height: 100%;
          `}
        />
      )
    }
    {
      view === views.EVENTS
      && (
        <CalendarIcon
          css={css`
            width: 100%; height: 100%;
          `}
        />
      )
    }
  </div>
);

export const CalendarHeaderIcon = calendarHeaderIconContainer(PureCalendarHeaderIcon);

export const calendarHeaderContainer = compose(
  connect(
    (state) => ({
      cursor: selectCursor(state),
      navigationOrientation: selectNavigationOrientation(state),
    }),
  ),
  withPropsOnChange(['cursor'], (props) => ({
    ...props,
    animation: getAnimation(props.navigationOrientation),
  })),
);

export const PureCalendarHeader = ({
  // state
  cursor,
  navigationOrientation,
  animation,
}) => (
  <div
    css={css`
      border-bottom: 1px solid #f1f1f1; padding: 15px 15px 8px; overflow-y: hidden;
    `}
  >
    <div
      css={css`
        display: flex; align-items: center; justify-content: space-between;
      `}
    >
      <div
        css={css`
          overflow: hidden; width: 100px; height: 25px;
          user-select: none;
        `}
      > 
        <div
          css={css`
            animation: ${animation} 200ms linear;
            position: relative;
            width: 100%; height: 100%;
          `}
        >
          {
            navigationOrientation === navigationOrientations.RIGHT
            && (
              <h3
                key={cursor.clone().subtract(1, 'month').format('YYYY-MM-DD')}
                css={css`
                  position: absolute; top: 0; left: -100%; margin: 0;
                  width: 100%;
                  font-size: 22px; font-weight: 500;
                `}
              >
                {cursor.clone().subtract(1, 'month').format('YYYY MMM')}
              </h3>
            )
          }
          <h3
            css={css`
              position: absolute; top: 0; left: 0; margin: 0;
              width: 100%;
              font-size: 22px; font-weight: 500;
            `}
          >
            {cursor.format('YYYY MMM')}
          </h3>
          {
            navigationOrientation === navigationOrientations.LEFT
            && (
              <h3
                key={cursor.clone().add(1, 'month').format('YYYY-MM-DD')}
                css={css`
                  position: absolute; top: 0; left: 100%; margin: 0;
                  width: 100%;
                  font-size: 22px; font-weight: 500;
                `}
              >
                {cursor.clone().add(1, 'month').format('YYYY MMM')}
              </h3>
            )
          }
        </div>
      </div>
      <CalendarHeaderIcon />
    </div>
  </div>
);

PureCalendarHeader.propTypes = {
  // view: PropTypes.oneOf(Object.values(views)).isRequired,
  cursor: PropTypes.object.isRequired,
  // toggleEventsView: PropTypes.func.isRequired,
  navigationOrientation: PropTypes.oneOf(Object.values(navigationOrientations)).isRequired,
};


export default calendarHeaderContainer(PureCalendarHeader);

