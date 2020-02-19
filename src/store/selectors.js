import { compose } from 'recompose';
import {
  isBefore,
  isWithinInterval,
  isAfter,
  isSameDay,
  format,
  add,
  setDate,
  setMinutes,
} from 'date-fns/fp';

export const selectNavigationOrientation = (state) => state.navigationOrientation;
export const selectCursor = (state) => state.cursor;
export const selectSelectedEvent = (state) => state.selectedEvent;
export const selectSelectedRange = (state) => state.selectedRange;
export const selectCurrentDate = (state) => state.currentDate;
export const selectDisplayDate = (state) => state.displayDate;
export const selectEvents = (state) => state.events;
export const selectView = (state) => state.view;
export const selectNavigationHistory = (state) => (
  state.navigationHistory
);
export const selectScrollTop = (state) => state.scrollTop;

export const sortEvents = (events) => [].concat(events).sort((e1, e2) => (
  isBefore(setMinutes(e1.start, 0), setMinutes(e2.start, 0))
));

export const selectEventsInYear = (events, years) => events.filter((e) => (
  years.includes(format('yyyy')(e.start))
  || years.includes(format('yyyy')(e.end))
));

export const selectEventsByMonth = (events) => events.reduce((acc, cur) => {
  const monthKey = `${cur.start.getFullYear()}-${cur.start.getMonth()}`;
  if (!Array.isArray(acc[monthKey])) {
    acc[monthKey] = [];
  }

  acc[monthKey].push(cur);
  return acc;
}, {});

export const selectEventsInMonth = (events, month) => {
  const prevMonth = setDate(0)(month);
  const nextMonth = compose(setDate(1), add({ months: 1 }))(month);

  return events.reduce((acc, cur) => {
    if (
      isWithinInterval({ start: prevMonth, end: nextMonth })(cur.start)
      && isWithinInterval({ start: prevMonth, end: nextMonth })(cur.end)
    ) acc.push(cur);
    return acc;
  }, []);
};

export const selectEventsInRange = (events, start, end) => {
  if (!start || !end) return [];

  return events.reduce((acc, cur) => {
    // TODO: make it legible ffs
    if (
      (
        (isSameDay(start)(cur.start) || isBefore(start)(cur.start))
        && (isSameDay(start)(cur.end) || isAfter(start)(cur.end))
      )
      || (
        (
          isSameDay(start)(cur.start)
          || isSameDay(end)(cur.start)
          || isWithinInterval({ start, end })(cur.start)
        )
        || (
          isSameDay(end)(cur.end)
          || isSameDay(end)(cur.end)
          || isWithinInterval({ start, end })(cur.end)
        )
      )
    ) {
      acc.push(cur);
    }

    return acc;
  }, []);
};
