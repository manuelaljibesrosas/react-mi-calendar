import { createReducer } from 'redux-create-reducer';
import {
  isBefore,
  sub,
  add,
} from 'date-fns/fp';
import { openDB } from 'idb';
import {
  UPDATE_SCROLL_TOP,
  SET_SELECTED_EVENT,
  ADD_EVENT,
  UPDATE_EVENT,
  REMOVE_EVENT,
  NAVIGATE,
  SET_RANGE,
  SET_DISPLAY_DATE,
  SET_CURRENT_DATE,
  SET_SEARCH_KEYWORD,
  RESET,
} from './actions';
import {
  views,
  navigationOrientations,
} from './constants';
import {
  reduce,
  generateId,
  sortEvents,
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
  // this is used by the EditEvent and ViewEvent components
  // to determine which event to edit/show
  selectedEvent: null,
  // used by the MonthDisplayGrid component to determine the
  // transition animation when the user navigates between months
  navigationOrientation: navigationOrientations.NONE,
  scrollTop: 0,
  searchKeyword: '',
  isSelectingRange: false,
};

export default createReducer(initialState, {
  [UPDATE_SCROLL_TOP]: reduce('scrollTop'),
  [SET_SELECTED_EVENT]: reduce('selectedEvent'),
  [SET_SEARCH_KEYWORD]: reduce('searchKeyword'),
  [ADD_EVENT]: (state, { payload }) => {
    const event = {
      id: generateId(),
      ...payload,
    };

    if (typeof indexedDB !== 'undefined') {
      openDB('react-mi-calendar', 1)
        .then((db) => (
          db.add('events', event)
        ));
    }

    return {
      ...state,
      events: state.events.concat([event]).sort(sortEvents),
    };
  },
  [UPDATE_EVENT]: (state, { payload }) => {
    const index = state.events.findIndex((e) => e.id === payload.id);
    const updatedEvent = {
      ...state.events[index],
      ...payload,
    };
    const ret = { ...state };
    ret.events[index] = updatedEvent;
    ret.selectedEvent = updatedEvent;

    if (typeof indexedDB !== 'undefined') {
      openDB('react-mi-calendar', 1)
        .then((db) => {
          const tx = db.transaction('events', 'readwrite');
          tx.store.put(updatedEvent);
        });
    }

    return ret;
  },
  [REMOVE_EVENT]: (state, { payload: eventId }) => {
    const index = state.events.findIndex((e) => e.id === eventId);
    const newEvents = [].concat(state.events);
    newEvents.splice(index, 1);

    if (typeof indexedDB !== 'undefined') {
      openDB('react-mi-calendar', 1)
        .then((db) => {
          const tx = db.transaction('events', 'readwrite');
          tx.store.delete(eventId);
        });
    }

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
