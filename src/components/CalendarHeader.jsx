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
import {
  animationStore,
  animationStatus,
} from '../store/animationStore';
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

    this.ref = React.createRef();
  }

  componentDidMount() {
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
    } = this.props;

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
            `}
          > 
            <div
              css={css`
                position: relative;
                width: 100%; height: 100%;
              `}
            >
              <h3
                css={css`
                  position: absolute; top: 0; left: 0; margin: 0;
                  width: 100%; display: flex;
                  font-size: 22px; font-weight: 500;
                `}
              >
                <div
                  css={css`
                    margin-right: 5px;
                  `}
                >
                  {format('yyyy')(cursor)}
                </div>
                <div
                  css={css`
                    overflow: hidden;
                  `}
                >
                  <div
                    ref={this.ref}
                    css={css`
                      will-change: transform;
                      position: relative;
                      width: 50px;
                    `}
                  >
                    <span
                      css={css`
                        position: absolute; top: 0; left: 0;
                        transform: translateX(-100%);
                        width: 100%;
                      `}
                    >
                      {compose(format('MMM'), sub({ months: 1 }))(cursor)}
                    </span>
                    <span
                      css={css`
                        width: 100%;
                      `}
                    >
                      {format('MMM')(cursor)}
                    </span>
                    <span
                      css={css`
                        position: absolute; top: 0; left: 0;
                        transform: translateX(100%);
                        width: 100%;
                      `}
                    >
                      {compose(format('MMM'), add({ months: 1 }))(cursor)}
                    </span>
                  </div>
                </div>
              </h3>
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

