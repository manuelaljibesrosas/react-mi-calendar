import assert from 'assert';
import moment from 'moment';
import store from '../src/store';
import { views } from '../src/store/constants';
import {
  setSelectedEvent,
  goBack,
  addEvent,
  updateEvent,
  removeEvent,
  setView,
  setCurrentDate,
  setRange,
  navigateLeft,
  navigateRight,
} from '../src/store/actions';
import {
  selectEventsInMonth,
  selectEventsInRange,
  selectEventsByMonth,
  selectEventsInYear,
  sortEvents,
} from '../src/store/selectors';
import { searchEvents } from '../src/store/reductions';

const formatStr = 'YYYY-MM-DD H:mm';

const events = [
  {
    start: moment('2020-01-16 0:00', formatStr),
    end: moment('2020-01-19 23:59', formatStr),
    name: 'Maria Gabriela birthday weekend',
    description: 'Maria Gabriela\'s birthday',
  },
  {
    start: moment('2002-11-17 0:00', formatStr),
    end: moment('2002-11-17 23:59', formatStr),
    name: 'Metroid Prime launch',
    description: 'The launch of the popular franchise',
  },
  {
    start: moment('2004-11-15 0:00', formatStr),
    end: moment('2004-11-15 23:59', formatStr),
    name: 'Metroid Prime 2 launch',
  },
  {
    start: moment('2007-08-27 0:00', formatStr),
    end: moment('2007-08-27 23:59', formatStr),
    name: 'Metroid Prime 3 launch',
  },
];

const cleanStore = () => store.dispatch({ type: 'RESET' });

describe('state', function() {
  beforeEach(cleanStore);
  after(cleanStore);
  describe('navigateLeft', function() {
    it('should change cursor value to previous month', function() {
      store.dispatch(navigateLeft());
      const date = moment().subtract(1, 'months');
      assert(moment(store.getState().cursor).isSame(date, 'month'));
    });
  });
  describe('navigateRight', function() {
    it('should change cursor value to next month', function() {
      store.dispatch(navigateRight());
      const date = moment().add(1, 'months');
      assert(moment(store.getState().cursor).isSame(date, 'month'));
    });
  });
  describe('setRange', function() {
    it('should set range correctly', function() {
      store.dispatch(setRange({
        start: moment('1992-11-30'),
        end: moment('2001-10-10'),
      }));
      const state = store.getState();
      assert(
        state.selectedRange.start.isSame(moment('1992-11-30'), 'day') &&
        state.selectedRange.end.isSame(moment('2001-10-10'), 'day')
      );
    });
  });
  describe('setCurrentDate', function() {
    it('should set currentDate', function() {
      store.dispatch(setCurrentDate(moment('2001-10-10')));
      const state = store.getState();
      assert(state.currentDate.isSame(moment('2001-10-10'), 'day'));  
    });
  });
  describe('setCalendarView', function() {
    it('should set view', function() {
      store.dispatch(setView(views.CREATE_EVENT));
      const state = store.getState();
      assert(
        state.view === views.CREATE_EVENT &&
        state.navigationHistory.length &&
        state.navigationHistory[0] === views.CALENDAR
      );
    });
  });
  describe('goBack', function() {
    it('should use history to handle a goBack request', function() {
      store.dispatch(setView(views.EVENTS));
      store.dispatch(setView(views.EVENT_DETAILS));      
      store.dispatch(goBack());
      const state = store.getState();

      assert(
        state.navigationHistory[state.navigationHistory.length - 1] === views.CALENDAR &&
        state.view === views.EVENTS
      );
    });
  });
  describe('setSelectedEvent', function() {
    it('should set selected event', function() {
      const event = events[1];
      store.dispatch(addEvent(event));
      let state = store.getState();
      const { id } = state.events[0];
      store.dispatch(setSelectedEvent(id));
      state = store.getState();
      assert(state.selectedEvent.id === event.id);
    });
  });
  describe('addEvent', function() {
    it('should add event', function() {
      const event = events[1];
      store.dispatch(addEvent(event));
      const state = store.getState();
      assert(
        state.events[0].name === event.name &&
        state.events.length === 1
      );
    });
  });
  describe('updateEvent', function() {
    it('should update event', function() {
      const event = events[1];
      store.dispatch(addEvent(event));
      let state = store.getState();
      const { id } = state.events.find(e => e.name === event.name);
      const updatedName = 'newName';
      store.dispatch(updateEvent({
        id,
        name: updatedName,
      }));
      state = store.getState();
      assert(state.events.find(e => e.id === id).name === updatedName);
    });
  });
  describe('removeEvents', function() {
    it('should remove event', function() {
      const event = events[1];
      store.dispatch(addEvent(event));
      let state = store.getState();
      const { id } = state.events.find(e => e.name === event.name);
      store.dispatch(removeEvent(id));
      state = store.getState();
      assert(state.events.findIndex(e => e.name === event.name) < 0);
    });
  });
});

describe('selectors', function() {
  beforeEach(cleanStore);
  after(cleanStore);
  describe('selectEventsInRange', function() {
    it('should select events in range', function() {
      const start = moment('2020-01-01');
      const end = moment('2020-02-01');
      const eventsInRange = selectEventsInRange(events, start, end);
      assert(
        Array.isArray(eventsInRange) &&
        eventsInRange.length === 1
      );
    });
    it(
      'should return an empty list if a null range is provided',
      function() {
        const eventsInRange = selectEventsInRange(events, null, null);
        assert(
          Array.isArray(eventsInRange) &&
          eventsInRange.length === 0
        );
      }
    );
  });
  describe('sortEvents', function() {
    it('should sort events in ascending order', function() {
      const unsortedEvents = [
        {
          name: 'event3',
          start: moment('2020-11-30 0:00', formatStr),
          end: moment('2020-11-30 23:59', formatStr),
        },
        {
          name: 'event2',
          start: moment('2020-05-24 0:00', formatStr),
          end: moment('2020-05-24 23:59', formatStr),
        },
        {
          name: 'event1',
          start: moment('2020-01-16 0:00', formatStr),
          end: moment('2020-01-16 23:59', formatStr),
        },
      ];
      const sortedEvents = sortEvents(unsortedEvents);
      assert(
        sortedEvents.length === 3 &&
        sortedEvents[0].name === 'event1'
      );
    });
  });
  describe('selectEventsInMonth', function() {
    it('should select events in month', function() {
      const month = moment('2020-01-01');
      const eventsInMonth = selectEventsInMonth(events, month); 
      const prevMonth = month.clone().date(0);
      const nextMonth = month.clone().add(1, 'month').date(1);
      assert(
        eventsInMonth.findIndex(e =>
          !e.start.isBetween(prevMonth, nextMonth) &&
          !e.end.isBetween(prevMonth, nextMonth)
        ) < 0
      );
    });
  });
});

describe('data reductions', function() {
  beforeEach(cleanStore);
  after(cleanStore);
  it('should get range of visible days from previous month');
  it('should get range of visible days from next month');
  it('should get number of days from current month');
  it('should handle selection of range inside month display');
  describe('event list', function() {
    it('should organize events by month', function() {
      const eventsByMonth = selectEventsByMonth(events);
      assert(
        typeof eventsByMonth === 'object' &&
        Object.keys(eventsByMonth).length === 4
      );
    });
    it('should filter events by year', function() {
      const eventsInYear = selectEventsInYear(events, '2020');
      assert(eventsInYear.length === 1);
    });
    it('should search events', function() {
      const filteredEvents = searchEvents(events, 'Maria');
      assert(filteredEvents.length === 1);
    });
  });
});
 
describe('storage', function() {
  it('should support CREATE operation');
  it('should support UPDATE operation');
  it('should support DELETE operation');
});

