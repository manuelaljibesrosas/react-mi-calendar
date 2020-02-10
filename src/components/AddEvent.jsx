import { connect } from 'react-redux';
import {
  compose,
  withState,
  withProps,
  withHandlers,
} from 'recompose';
import moment from 'moment';
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
    start: range.start || moment(),
    end: range.end || moment(),
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
