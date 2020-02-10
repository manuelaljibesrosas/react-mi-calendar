/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { views } from '../store/constants';
// selectors
import {
  selectEvents,
  selectSelectedRange,
  selectEventsInRange,
} from '../store/selectors';
// actions
import {
  setView,
  setSelectedEvent,
} from '../store/actions';
// components
import EventItem from './EventItem';

// TODO: this renders on each frame bc the scrollTop
// tracking we're doing is updating the state, this
// makes the equality check between the new events and old
// false because the pointer is different
const eventListContainer = connect(
  (state) => ({
    events: selectEventsInRange(
      selectEvents(state),
      selectSelectedRange(state).start,
      selectSelectedRange(state).end,
    ),
  }),
  (dispatch) => ({
    openEventDetails: (e) => {
      dispatch(setSelectedEvent(e));
      dispatch(setView(views.EVENT_DETAILS));
    },
  }),
);

export const PureEventList = ({
  // state
  events,
  // actions
  openEventDetails,
}) => (
  <div
    css={css`
      display: flex; flex-direction: column;
    `}
  >
    {
      events.map((event) => (
        <div
          key={event.id}
          css={css`
            margin-bottom: 10px;
          `}
        >
          <EventItem
            onClick={() => openEventDetails(event)}
            {...event}
          />
        </div>
      ))
    }
  </div>
);

PureEventList.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  events: PropTypes.array.isRequired,
  openEventDetails: PropTypes.func.isRequired,
};

export default eventListContainer(PureEventList);
