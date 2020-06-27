/** @jsx jsx */
import { jsx, css, keyframes } from '@emotion/core';
import {
  compose,
  withState,
  withHandlers,
} from 'recompose';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  format,
  getHours,
} from 'date-fns/fp';
import { views } from '../store/constants';
// selectors
import { selectSelectedEvent } from '../store/selectors';
// actions
import { removeEvent } from '../store/actions';
import {
  push,
  goBack,
} from 'connected-react-router';
// components
import TrashCanIcon from '../svg/trashcan.svg';
import EditIcon from '../svg/edit.svg';
import ChevronLeftIcon from '../svg/chevron-left.svg';
import Button from './Button';

const timesOfDay = {
  MORNING: 'MORNING',
  NOON: 'NOON',
  NIGHT: 'NIGHT',
};

const getTimeOfDay = (hour) => {
  if (hour >= 6 && hour <= 12) {
    return timesOfDay.MORNING;
  }
  if (hour > 12 && hour < 19) {
    return timesOfDay.NOON;
  }
  return timesOfDay.NIGHT;
};

const headerColors = {
  [timesOfDay.MORNING]: 'linear-gradient(#3bb47f, #5ec695)',
  [timesOfDay.NOON]: 'linear-gradient(#e97d56, #f1a877)',
  [timesOfDay.NIGHT]: 'linear-gradient(#545c9a, #6e74ae)',
};

const slideUp = keyframes`
  from {
    transform: translate3d(0, 100%, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: .5;
  }
  to {
    opacity: 1;
  }
`;

const DeleteEventDialog = ({
  cancel,
  confirm,
}) => (
  <div
    css={css`
      position: absolute; top: 0; left: 0;
      width: 100%; height: 100%; overflow: hidden;
    `}
  >
    <div
      css={css`
        animation: ${fadeIn} 170ms ease-in;
        position: absolute; top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0, 0, 0, .3);
      `}
      onClick={cancel}
    />
    <div
      css={css`
        animation: ${slideUp} 170ms ease-in;
        position: absolute; bottom: 0;
        display: flex; flex-direction: column;
        align-items: center; width: 100%;
        padding: 22px 0;
        background: #fff; border-radius: 22px 22px 0 0;
      `}
    >
      <h4
        css={css`
          margin: 0 0 22px;
        `}
      >
        Delete this event?
      </h4>
      <div
        css={css`
          display: flex; justify-content: center; width: 100%;
        `}
      >
        <div
          css={css`
            margin-right: 15px;
          `}
          onClick={cancel}
        >
          <Button label="Cancel" />
        </div>
        <div onClick={confirm}>
          <Button label="OK" color="#0398f8" />
        </div>
      </div>
    </div>
  </div>
);

DeleteEventDialog.propTypes = {
  cancel: PropTypes.func.isRequired,
  confirm: PropTypes.func.isRequired,
};

const EventDetails = ({
  // state
  event: {
    name,
    start,
    end,
    description,
    location,
  },
  state: { deleteRequested },
  // actions
  requestDeleteEvent,
  goBack,
  navigateToEditEvent,
  deleteEvent,
  cancelDelete,
}) => (
  <div
    css={css`
      height: 100%;
      background-color: #f9f9f9;
    `}
  >
    <div
      css={css`
        position: relative;
        display: flex; flex-direction: column; justify-content: flex-end; padding: 20px 20px; height 250px;
        background-image: ${headerColors[getTimeOfDay(getHours(start))]};
      `}
    >
      {
        getTimeOfDay(start.getHours()) === timesOfDay.NOON
        && (
          <svg
            css={css`
              pointer-events: none;
              position: absolute; top: 0; left: 0;
              width: 100%; height: 100%;
            `}
          >
            <circle r="20" cx="14%" cy="17%" fill="white" opacity="30%"/>
            <circle r="12" cx="32%" cy="34%" fill="white" opacity="15%"/>
            <circle r="23.5" cx="75%" cy="80%" fill="white" opacity="12%"/>
            <circle r="50" cx="90%" cy="90%" fill="white" opacity="10%"/>
          </svg>
        )
      }
      {
        getTimeOfDay(start.getHours()) === timesOfDay.MORNING
        && (
          <svg
            css={css`
              pointer-events: none;
              position: absolute; top: 0; left: 0;
              width: 100%; height: 100%;
            `}
          >
            <defs>
              <path
                id="bird"
                d="M 0 40 L 100 80 85 40 100 0"
                fill="#2aaa77"
                transform="scale(.18) rotate(190, 50, 40)"
              />
            </defs>
            <use href="#bird" x="38%" y="50%" />
            <use href="#bird" x="44%" y="42%" />
            <use href="#bird" x="50%" y="48%" />
            <use href="#bird" x="55%" y="38%" />
            <use href="#bird" x="60%" y="27%" />
            <use href="#bird" x="80%" y="43%" />
          </svg>
        )
      }
      {
        getTimeOfDay(start.getHours()) === timesOfDay.NIGHT
        && (
          <svg
            css={css`
              pointer-events: none;
              position: absolute; top: 0; left: 0;
              width: 100%; height: 100%;
            `}
            viewBox="0 0 350 220"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="myGradient" gradientTransform="rotate(90)">
                <stop offset="5%"  stop-color="#fff" />
                <stop offset="95%" stop-color="#fff" stop-opacity="0" />
              </linearGradient>
              <g id="comet">
                <path
                  d="M 0 0 L 30 30"
                  stroke="url('#myGradient')"
                  transform="rotate(280, 0, 0)"
                />
                <circle r="1.2" cx="0" cy="0" fill="#fff" />
              </g>
              <circle id="star" r="1" cx="0" cy="0" fill="#fff" />
            </defs>
            <use href="#star" transform="translate(40, 40)" opacity=".7" />
            <use href="#comet" transform="translate(30, 85)" opacity=".6" />
            <use href="#star" transform="translate(110, 60)" opacity=".7" />
            <use href="#star" transform="translate(120, 100)" opacity=".4" />
            <use href="#star" transform="translate(120, 30)" opacity=".3" />
            <use href="#star" transform="translate(150, 20)" opacity=".35" />
            <use href="#star" transform="translate(190, 40)" opacity=".4" />
            <use href="#star" transform="translate(185, 80)" opacity=".5" />
            <use href="#comet" transform="translate(230, 60)" opacity=".8" />
            <use href="#star" transform="translate(240, 20)" opacity=".3" />
            <use href="#star" transform="translate(280, 40)" opacity="1" />
            <use href="#star" transform="translate(315, 50)" opacity=".5" />
          </svg>
        )
      }
      <div
        onClick={goBack}
        css={css`
          position: absolute; top: 20px; left: 20px;
          width: 12px; height: 20px;
          cursor: pointer;
        `}
      >
        <ChevronLeftIcon
          css={css`
            width: 100%; height: 100%;
          `}
        />
      </div>
      <h2
        css={css`
          margin: 0 0 8px;
          font-weight: 500; font-size: 22px;
        `}
      >
        {name}
      </h2>
      <h5
        css={css`
        margin: 0;
        font-weight: 400;
        `}
      >
        {`${format('EEEE, MMMM d, h:mm a')(start)} - ${format('EEEE, MMMM d, h:mm a')(start)}${location && ` | ${location}`}`}
      </h5>
    </div>
    <div
      css={css`
        padding: 18px 25px;
        background-color: #fff;
      `}
    >
      <h3
        css={css`
          margin: 0 0 8px;
          font-weight: 500; font-size: 14px;
        `}
      >
        {'Description'}
      </h3>
      <p
        css={css`
          margin: 0;
          padding-left: 20px;
          font-size: 14px;
        `}
      >
        {description || 'No description'}
      </p>
    </div>
    <div
      css={css`
        position: absolute; bottom: 0; left: 0;
        display: flex; justify-content: center; align-items: center; width: 100%;
        background: #fff;
      `}
    >
      <div
        css={css`
          margin-right: 35px;
          display: flex; flex-direction: column;
          justify-content: center; align-items: center; padding: 15px 0;
          cursor: pointer;
        `}
        onClick={navigateToEditEvent}
      >
        <EditIcon
          css={css`
            margin-bottom: 5px;
            width: 16px; height: 16px;
          `}
        />
        <span
          css={css`
            font-size: 12px;
          `}
        >
          {'Edit'}
        </span>
      </div>
      <div
        css={css`
          display: flex; flex-direction: column;
          justify-content: center; align-items: center; padding: 15px 0;
          cursor: pointer;
        `}
        onClick={requestDeleteEvent}
      >
        <TrashCanIcon
          css={css`
            margin-bottom: 5px;
            width: 16px; height: 16px;
          `}
        />
        <span
          css={css`
            font-size: 12px;
          `}
        >
          {'Delete'}
        </span>
      </div>
    </div>
    {
      deleteRequested
      && (
        <DeleteEventDialog
          cancel={cancelDelete}
          confirm={deleteEvent}
        />
      )
    }
  </div>
);

EventDetails.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  event: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  state: PropTypes.object.isRequired,
  requestDeleteEvent: PropTypes.func.isRequired,
  goBack: PropTypes.func.isRequired,
  navigateToEditEvent: PropTypes.func.isRequired,
  deleteEvent: PropTypes.func.isRequired,
  cancelDelete: PropTypes.func.isRequired,
};

export default compose(
  connect(
    (state) => ({
      event: selectSelectedEvent(state),
    }),
    (dispatch) => ({
      goBack: () => dispatch(goBack()),
      navigateToEditEvent: () => dispatch(push(views.EDIT_EVENT)),
      removeEvent: ({ id }) => dispatch(removeEvent(id)),
    }),
  ),
  withState('state', 'setState', { deleteRequested: false }),
  withHandlers({
    requestDeleteEvent: ({ setState }) => () => setState({
      deleteRequested: true,
    }),
    cancelDelete: ({ setState }) => () => setState({
      deleteRequested: false,
    }),
    deleteEvent: ({
      removeEvent,
      goBack,
      event,
    }) => () => {
      goBack();
      removeEvent(event);
    },
  }),
)(EventDetails);
