import { connect } from 'react-redux';
import {
  compose,
  withState,
  withProps,
  withHandlers,
} from 'recompose';
import {
  isSameMinute,
  isBefore,
  sub,
  add,
} from 'date-fns/fp';
// selectors
import { selectSelectedEvent } from '../store/selectors';
// actions
import {
  goBack,
  updateEvent,
} from '../store/actions';
// components
import EditEventForm from './EditEventForm';

const editEventContainer = compose(
  connect(
    (state) => ({
      event: selectSelectedEvent(state),
    }),
    (dispatch) => ({
      updateEvent: (e) => dispatch(updateEvent(e)),
      goBack: () => dispatch(goBack()),
    }),
  ),
  withState('state', 'setState', ({ event }) => ({
    name: '',
    location: '',
    description: '',
    ...event,
  })),
  withHandlers({
    handleInputChange: ({
      state,
      setState,
    }) => (e) => setState({
      ...state,
      [e.target.name]: e.target.value,
    }),
    handleDatePickerChange: ({
      state,
      setState,
    }) => (value, name) => {
      // TODO: isSameOrBefore 'minute'
      if (name === 'start' && (isSameMinute(value)(state.end) || isBefore(value)(state.end))) {
        return setState({
          ...state,
          start: value,
          end: add({ hours: 1 })(value),
        });
      }
      // TODO: isSameOrAfter 'minute'
      if (name === 'end' && (isSameMinute(value)(state.start) || isBefore(value)(state.start))) {
        return setState({
          ...state,
          start: sub({ hours: 1 })(value),
          end: value,
        });
      }
      return setState({
        ...state,
        [name]: value,
      });
    },
    handleFormSubmit: ({
      state,
      setState,
      updateEvent,
      goBack,
    }) => () => {
      updateEvent(state);
      goBack();
    },
  }),
  withProps({
    title: 'Edit Event',
  }),
);

export default editEventContainer(EditEventForm);

