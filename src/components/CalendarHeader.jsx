/** @jsx jsx */
import React from 'react';
import { jsx, css } from '@emotion/core';
import { connect } from 'react-redux';
import {
  compose,
  withHandlers,
  withPropsOnChange,
} from 'recompose';
import PropTypes from 'prop-types';
import {
  add,
  sub,
  format,
} from 'date-fns/fp';
import {
  navigationOrientations,
  views,
} from '../store/constants';
import { tween } from '../store/animations';
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
import { push } from 'connected-react-router';

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
    { push },
  ),
  withHandlers(({
    toggleEventsView: ({
      view,
      push,
      setView,
    }) => () => {
      if (view === views.CALENDAR) {
        push(views.EVENTS);
      } else {
        push(views.CALENDAR);
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
      width: 18px; height: 18px;
    `}
    onClick={toggleEventsView}
  >
    {
      view === views.EVENTS
      && (
        <EventsIcon
          css={css`
            width: 100%; height: 100%;
          `}
        />
      )
    }
    {
      view === views.CALENDAR
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

export const calendarHeaderContainer = connect(
  (state) => ({
    cursor: selectCursor(state),
    navigationOrientation: selectNavigationOrientation(state),
  }),
);

class CalendarHeader extends React.Component {
  constructor(props) {
    super(props);

    this.isAnimating = false;
    this.ref = React.createRef();

    this.animate = this.animate.bind(this);
  }

  animate(orientation) {
    if (orientation === navigationOrientations.NONE) return;

    this.isAnimating = true;

    if (orientation === navigationOrientations.RIGHT) {
      tween({
        from: 100,
        to: 0,
        duration: 200,
        onUpdate: (value) => {
          this.ref.current.style.transform = `translateX(${value}%)`;
        },
        onComplete: () => {
          this.isAnimating = false;
        },
      });
    }

    if (orientation === navigationOrientations.LEFT) {
      tween({
        from: -100,
        to: 0,
        duration: 200,
        onUpdate: (value) => {
          this.ref.current.style.transform = `translateX(${value}%)`;
        },
        onComplete: () => {
          this.isAnimating = false;
        },
      });
    }
  };

  render() {
    const {
      // state
      cursor,
      navigationOrientation,
    } = this.props;

    if (!this.isAnimating) {
      this.animate(navigationOrientation);
    }
    
    return (
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
              ref={this.ref}
              css={css`
                position: relative;
                width: 100%; height: 100%;
              `}
            >
              {
                navigationOrientation === navigationOrientations.RIGHT
                && (
                  <h3
                    key={compose(format('yyyy-MM-dd'), sub({ months: 1 }))(cursor)}
                    css={css`
                      position: absolute; top: 0; left: -100%; margin: 0;
                      width: 100%;
                      font-size: 22px; font-weight: 500;
                    `}
                  >
                    {compose(format('yyyy MMM'), sub({ months: 1 }))(cursor)}
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
                {format('yyyy MMM')(cursor)}
              </h3>
              {
                navigationOrientation === navigationOrientations.LEFT
                && (
                  <h3
                    key={compose(format('yyyy-MM-dd'), add({ months: 1 }))(cursor)}
                    css={css`
                      position: absolute; top: 0; left: 100%; margin: 0;
                      width: 100%;
                      font-size: 22px; font-weight: 500;
                    `}
                  >
                    {compose(format('yyyy MMM'), add({ months: 1 }))(cursor)}
                  </h3>
                )
              }
            </div>
          </div>
          <CalendarHeaderIcon />
        </div>
      </div>
    );
  }
}

CalendarHeader.propTypes = {
  // view: PropTypes.oneOf(Object.values(views)).isRequired,
  cursor: PropTypes.object.isRequired,
  // toggleEventsView: PropTypes.func.isRequired,
  navigationOrientation: PropTypes.oneOf(Object.values(navigationOrientations)).isRequired,
};

const ConnectedCalendarHeader = calendarHeaderContainer(CalendarHeader);

export default ConnectedCalendarHeader;

