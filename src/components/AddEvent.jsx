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
import { selectSelectedRange } from '../store/selectors';
// actions
import {
  goBack,
  addEvent,
} from '../store/actions';
// components
import EditEventForm from './EditEventForm';

export const addEventContainer = compose(
  connect(
    (state) => ({
      range: selectSelectedRange(state),
    }),
    (dispatch) => ({
      addEvent: (e) => dispatch(addEvent(e)),
      goBack: () => dispatch(goBack()),
    }),
  ),
  withState('state', 'setState', ({ range }) => ({
    name: '',
    location: '',
    description: '',
    start: range.start || new Date(),
    end: range.end || new Date(),
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
      addEvent,
      goBack,
    }) => () => {
      addEvent({
        ...state,
        name: state.name || 'Untitled',
      });
      goBack();
    },
  }),
  withProps({
    title: 'Add Event',
  }),
);

export default addEventContainer(EditEventForm);
