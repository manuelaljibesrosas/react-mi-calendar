import moment from 'moment';
import { createReducer } from 'redux-create-reducer';
import {
  UPDATE_SCROLL_TOP,
  SET_SELECTED_EVENT,
  GO_BACK,
  ADD_EVENT,
  UPDATE_EVENT,
  REMOVE_EVENT,
  ADD_BULK_EVENTS,
  NAVIGATE,
  SET_RANGE,
  SET_DISPLAY_DATE,
  SET_CURRENT_DATE,
  SET_VIEW,
  RESET,
} from './actions';
import {
  views,
  navigationOrientations,
} from './constants';
import {
  reduce,
  generateId,
  getFormattedDateFromMoment,
} from './utils';

export const initialState = {
  // date range selected by the user, can be used to see events
  // happening in the range or to create new events
  selectedRange: {
    start: null,
    end: null,
  },
  // current date
  currentDate: moment(),
  // date that is displayed in the calendar view,
  // users sometimes navigate to other months/years without
  // necessarily selecting a new date
  cursor: moment(),
  events: [],
  // defines the current layout of the calendar, a list of
  // states are defined in the views constant
  view: views.CALENDAR,
  // this is used by the EditEvent and ViewEvent components
  // to determine which event to edit/show
  selectedEvent: null,
  // used to determine where to jump to when the goBack
  // action is dispatched
  navigationHistory: [],
  // used by the MonthDisplayGrid component to determine the
  // transition animation when the user navigates between months
  navigationOrientation: navigationOrientations.NONE,
  scrollTop: 0,
  xOffset: 0,
  isSelectingRange: false,
};

export default createReducer(initialState, {
  [UPDATE_SCROLL_TOP]: reduce('scrollTop'),
  [SET_SELECTED_EVENT]: reduce('selectedEvent'),
  [GO_BACK]: (state) => ({
    ...state,
    view: state.navigationHistory.slice(state.navigationHistory.length - 1)[0],
    navigationHistory: state.navigationHistory.slice(0, state.navigationHistory.length - 1),
  }),
  [ADD_EVENT]: (state, { payload }) => ({
    ...state,
    events: state.events.concat([{
      id: generateId(),
      ...payload,
    }]),
  }),
  [UPDATE_EVENT]: (state, { payload }) => {
    const index = state.events.findIndex((e) => e.id === payload.id);
    const updatedEvent = {
      ...state.events[index],
      ...payload,
    };
    const ret = { ...state };
    ret.events[index] = updatedEvent;
    ret.selectedEvent = updatedEvent;

    return ret;
  },
  [REMOVE_EVENT]: (state, { payload }) => {
    const index = state.events.findIndex((e) => e.id === payload);
    const newEvents = [].concat(state.events);
    newEvents.splice(index, 1);

    return {
      ...state,
      events: newEvents,
    };
  },
  [ADD_BULK_EVENTS]: (state, { payload }) => {
    const newEvents = payload.reduce((acc, cur) => {
      const startDate = getFormattedDateFromMoment(cur.start);
      if (!Object.prototype.hasOwnProperty.call(acc, startDate)) {
        acc[startDate] = [];
      }
      acc[startDate].push({
        ...cur,
        id: generateId(),
      });
      return acc;
    }, {});
    const updatedEvents = { ...state.events };

    // eslint-disable-next-line guard-for-in
    for (const date in newEvents) {
      if (!Object.prototype.hasOwnProperty.call(state.events, date)) {
        updatedEvents[date] = [];
      }
      updatedEvents[date].push(...newEvents[date]);
    }

    return {
      ...state,
      events: updatedEvents,
    };
  },
  [SET_RANGE]: (state, { payload: date }) => {
    const isSelecting = !!(state.selectedRange.start && !state.selectedRange.end)
      && state.selectedRange;
    let selectedRange;

    if (isSelecting) {
      if (date.isBefore(state.selectedRange.start, 'day')) {
        selectedRange = {
          start: date,
          end: null,
        };
      } else {
        selectedRange = {
          start: state.selectedRange.start,
          end: date,
        };
      }
    } else {
      selectedRange = {
        start: date,
        end: null,
      };
    }

    return {
      ...state,
      selectedRange,
    };
  },
  [SET_CURRENT_DATE]: reduce('currentDate'),
  [SET_DISPLAY_DATE]: reduce('cursor'),
  [SET_VIEW]: (state, { payload }) => ({
    ...state,
    navigationHistory: state.navigationHistory.concat([state.view]),
    view: payload,
  }),
  [NAVIGATE]: (state, { payload }) => {
    if (payload === navigationOrientations.LEFT) {
      return ({
        ...state,
        cursor: state.cursor.clone().subtract(1, 'months'),
        navigationOrientation: navigationOrientations.LEFT,
      });
    }

    if (payload === navigationOrientations.RIGHT) {
      return ({
        ...state,
        cursor: state.cursor.clone().add(1, 'months'),
        navigationOrientation: navigationOrientations.RIGHT,
      });
    }

    return state;
  },
  [RESET]: () => initialState,
});
