import { connect } from 'react-redux';
import {
  compose,
  withState,
  withProps,
  withHandlers,
} from 'recompose';
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
      if (name === 'start' && state.end.isSameOrBefore(value, 'minute')) {
        return setState({
          ...state,
          start: state.end.clone().subtract(1, 'hours'),
        });
      }
      if (name === 'end' && state.start.isSameOrAfter(value, 'minute')) {
        return setState({
          ...state,
          start: value.clone().subtract(1, 'hours'),
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

