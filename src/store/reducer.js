import { createReducer } from 'redux-create-reducer';
import {
  isBefore,
  sub,
  add,
} from 'date-fns/fp';
import {
  UPDATE_SCROLL_TOP,
  SET_SELECTED_EVENT,
  GO_BACK,
  ADD_EVENT,
  UPDATE_EVENT,
  REMOVE_EVENT,
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
} from './utils';

export const initialState = {
  // date range selected by the user, can be used to see events
  // happening in the range or to create new events
  selectedRange: {
    start: null,
    end: null,
  },
  // current date
  currentDate: new Date(),
  // date that is displayed in the calendar view,
  // users sometimes navigate to other months/years without
  // necessarily selecting a new date
  cursor: new Date(),
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
    }]).sort((a, b) => {
      if (a.start.getFullYear() === b.start.getFullYear()) {
        if (a.start.getMonth() === b.start.getMonth()) {
          if (a.start.getDate() === b.start.getDate()) {
            return a.start.getHours() - b.start.getHours();
          }
          return a.start.getDate() - b.start.getDate();
        }
        return a.start.getMonth() - b.start.getMonth();
      }
      return a.start.getFullYear() - b.start.getFullYear();
    }),
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
  [SET_RANGE]: (state, { payload: date }) => {
    const isSelecting = Boolean(
      !!(state.selectedRange.start && !state.selectedRange.end)
      && state.selectedRange,
    );
    let selectedRange;

    if (isSelecting) {
      // isBefore 'day'
      if (isBefore(state.selectedRange.start)(date)) {
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
        cursor: sub({ months: 1 })(state.cursor),
        navigationOrientation: navigationOrientations.LEFT,
      });
    }

    if (payload === navigationOrientations.RIGHT) {
      return ({
        ...state,
        cursor: add({ months: 1 })(state.cursor),
        navigationOrientation: navigationOrientations.RIGHT,
      });
    }

    return state;
  },
  [RESET]: () => initialState,
});
