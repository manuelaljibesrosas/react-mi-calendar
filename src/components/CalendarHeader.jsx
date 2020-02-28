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
import {
  easings,
  tween,
} from '../store/animations';
import {
  animationStore,
  animationStatus,
  navigate,
} from '../store/animationStore';
// assets
import SearchIcon from '../svg/search.svg';
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
import {
  navigateLeft,
  navigateRight,
  setSearchKeyword,
} from '../store/actions';
// components
import ChevronLeft from '../svg/chevron-left.svg';
import ChevronRight from '../svg/chevron-right.svg';
import TypeFace2 from './TypeFace2';

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

export const calendarHeaderContainer = compose(
  connect(
    (state) => ({
      view: selectView(state),
      cursor: selectCursor(state),
      navigationOrientation: selectNavigationOrientation(state),
    }),
    {
      navigateLeft,
      navigateRight,
      setSearchKeyword,
    },
  ),
  withHandlers({
    handleSearch: ({
      setSearchKeyword,
    }) => (e) => setSearchKeyword(e.target.value),
  }),
);

const monthLabel = css`
  place-self: center;
  user-select: none;
`;

class CalendarHeader extends React.Component {
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
      view,
      // actions
      handleSearch,
    } = this.props;

    return (
      <div
        css={css`
          border-bottom: 1px solid #dedede; padding: 15px calc(100% / 7 / 2 - 9px) 5px;
          overflow-y: hidden;
        `}
      >
        <div
          css={css`
            margin-bottom: 10px;
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
        {
          view === views.CALENDAR
          && (
            <div
              css={css`
                margin-bottom: 10px;
                display: flex; justify-content: space-between;
                height: 20px; align-items: center;

                @media (max-width: 420px) {
                  display: none;
                }
              `}
            >
              <div
                css={css`
                  width: 10px; height: 15px;
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
                  width: 10px; height: 15px;
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
          )
        }
        {
          view === views.CALENDAR
          && (
            <div
              css={css`
                display: flex; justify-content: space-between;
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
            </div>
          )
        }
        {
          view === views.EVENTS
          && (
            <div
              css={css`
                position: relative; margin: 0 0 5px;
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
          )
        }
      </div>
    );
  }
}

CalendarHeader.propTypes = {
  // view: PropTypes.oneOf(Object.values(views)).isRequired,
  cursor: PropTypes.object.isRequired,
  // toggleEventsView: PropTypes.func.isRequired,
  navigationOrientation: PropTypes.oneOf(Object.values(navigationOrientations)).isRequired,
  handleSearch: PropTypes.func.isRequired,
};

const ConnectedCalendarHeader = calendarHeaderContainer(CalendarHeader);

export default ConnectedCalendarHeader;

