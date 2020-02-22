import assert from 'assert';
import {
  add,
  sub,
  isSameDay,
  isSameMonth,
  getDaysInMonth,
} from 'date-fns/fp';
import { createStore } from 'redux';
import reducer from '../src/store/reducer';
import {
  setSelectedEvent,
  addEvent,
  updateEvent,
  removeEvent,
  setCurrentDate,
  setRange,
  navigateLeft,
  navigateRight,
} from '../src/store/actions';
import {
  selectEventsInRange,
  selectEventsByMonth,
  selectEventsInYear,
} from '../src/store/selectors';
import {
  searchEvents,
  sortEvents,
} from '../src/store/utils';

const store = createStore(reducer);

const events = [
  {
    start: new Date(2020, 1, 16, 0, 0),
    end: new Date(2020, 1, 19, 0, 0),
    name: 'Maria Gabriela birthday weekend',
  },
  {
    start: new Date(2002, 11, 7, 0, 0),
    end: new Date(2002, 11, 17, 23, 59),
    name: 'Metroid Prime launch',
  },
  {
    start: new Date(2004, 11, 15, 0, 0),
    end: new Date(2004, 11, 15, 23, 59),
    name: 'Metroid Prime 2 launch',
  },
  {
    start: new Date(2007, 8, 27, 0, 0),
    end: new Date(2007, 8, 27, 23, 59),
    name: 'Metroid Prime 3 launch',
  },
];

const cleanStore = () => store.dispatch({ type: 'RESET' });

describe('state', () => {
  beforeEach(cleanStore);
  after(cleanStore);
  describe('navigateLeft', () => {
    it('should change cursor value to previous month', () => {
      store.dispatch(navigateLeft());
      const date = sub({ months: 1 })(new Date());
      assert(isSameMonth(date)(store.getState().cursor));
    });
  });
  describe('navigateRight', () => {
    it('should change cursor value to next month', () => {
      store.dispatch(navigateRight());
      const date = add({ months: 1 })(new Date());
      assert(isSameMonth(date)(store.getState().cursor));
    });
  });
  describe('setRange', () => {
    it('should set range correctly', () => {
      const newRange = {
        start: new Date(1992, 11, 30),
        end: new Date(2001, 10, 10),
      };
      store.dispatch(setRange(newRange.start));
      store.dispatch(setRange(newRange.end));
      const state = store.getState();
      assert(
        isSameDay(newRange.start)(state.selectedRange.start)
        && isSameDay(newRange.end)(state.selectedRange.end),
      );
    });
    it(
      'should not allow the end of the range to be a date before the start',
      () => {
        const wrongRange = {
          start: new Date(1992, 11, 30),
          end: new Date(1991, 10, 10),
        };
        store.dispatch(setRange(wrongRange.start));
        store.dispatch(setRange(wrongRange.end));
        const state = store.getState();
        assert(
          isSameDay(wrongRange.end)(state.selectedRange.start)
          && !state.selectedRange.end,
        );
      },
    );
  });
  describe('setCurrentDate', () => {
    it('should set currentDate', () => {
      const newDate = new Date(2001, 10, 10);
      store.dispatch(setCurrentDate(newDate));
      const state = store.getState();
      assert(isSameDay(newDate)(state.currentDate));
    });
  });
  describe('setSelectedEvent', () => {
    it('should set selected event', () => {
      const evt = events[1];
      store.dispatch(addEvent(evt));
      let state = store.getState();
      const event = state.events[0];
      store.dispatch(setSelectedEvent(event));
      state = store.getState();
      assert(state.selectedEvent.id === event.id);
    });
  });
  describe('addEvent', () => {
    it('should add event', () => {
      const evt = events[0];
      store.dispatch(addEvent(evt));
      const state = store.getState();
      assert(state.events.length === 1);
    });
  });
  describe('updateEvent', () => {
    it('should update event', () => {
      const event = events[1];
      store.dispatch(addEvent(event));
      const updatedName = 'newName';
      store.dispatch(updateEvent({
        id: store.getState().events[0].id,
        name: updatedName,
      }));
      const state = store.getState();
      assert(state.events[0].name === updatedName);
    });
  });
  describe('removeEvents', () => {
    it('should remove event', () => {
      const evt = events[0];
      store.dispatch(addEvent(evt));
      let state = store.getState();
      store.dispatch(removeEvent(state.events[0].id));
      state = store.getState();
      assert(state.events.length === 0);
    });
  });
});

describe('selectors', () => {
  beforeEach(cleanStore);
  after(cleanStore);
  describe('sortEvents', () => {
    it('should sort events in ascending order', () => {
      const sortedEvents = sortEvents(events);
      assert(sortedEvents[0].name === 'Metroid Prime launch');
    });
  });
  describe('selectEventsByMonth', () => {
    it('should select events by month', () => {
      const eventsByMonth = selectEventsByMonth(events);
      assert(Object.keys(eventsByMonth).length === 4);
    });
    it(
      'should return an array of dates for each month',
      () => {
        const eventsByMonth = selectEventsByMonth(events);
        assert(eventsByMonth['2020-1'].length === getDaysInMonth(new Date(2020, 1)));
      },
    );
    it(
      'should put events into the days they belong to',
      () => {
        const parallelEvents = [
          {
            name: 'Conference',
            start: new Date(2020, 1, 22),
            end: new Date(2020, 1, 22, 11, 59),
          },
          {
            name: 'Convention',
            start: new Date(2020, 1, 21),
            end: new Date(2020, 1, 23),
          },
        ];
        const eventsByMonth = selectEventsByMonth(parallelEvents);
        assert(
          eventsByMonth['2020-1']['22'].length === 2
        );
      },
    );
  });
  describe('selectEventsInRange', () => {
    it('should select events in range', () => {
      const range = {
        start: new Date(2020, 1, 10),
        end: new Date(2020, 1, 20),
      };
      const eventsInRange = selectEventsInRange(
        events,
        range.start,
        range.end,
      );
      assert(
        Array.isArray(eventsInRange)
        && eventsInRange.length === 1,
      );
    });
  });
  describe('selectEventsInYear', () => {
    it('should filter events by year', () => {
      const eventsInYear = selectEventsInYear(events, '2020');
      assert(eventsInYear.length === 1);
    });
  });
  describe('searchEvents', () => {
    it('should search events', () => {
      const filteredEvents = searchEvents(events, 'Maria');
      assert(filteredEvents.length === 1);
    });
  });
});
