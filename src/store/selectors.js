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
  e1.start.isBefore(e2.start, 'minute') ? -1 : 1
));

export const selectEventsInYear = (events, years) => events.filter((e) => (
  years.includes(e.start.format('YYYY'))
  || years.includes(e.end.format('YYYY'))
));

export const selectEventsByMonth = (events) => events.reduce((acc, cur) => {
  if (!Array.isArray(acc[cur.start.format('YYYY-MM-DD')])) {
    acc[cur.start.format('YYYY-MM-DD')] = [];
  }

  acc[cur.start.format('YYYY-MM-DD')].push(cur);
  return acc;
}, {});

export const selectEventsInMonth = (events, month) => {
  const prevMonth = month.clone().date(0);
  const nextMonth = month.clone().add(1, 'month').date(1);

  return events.reduce((acc, cur) => {
    if (
      cur.start.isBetween(prevMonth, nextMonth)
      && cur.end.isBetween(prevMonth, nextMonth)
    ) acc.push(cur);
    return acc;
  }, []);
};

export const selectEventsInRange = (events, start, end) => {
  if (!start || !end) return [];

  return events.reduce((acc, cur) => {
    if (
      (
        cur.start.isSameOrBefore(start, 'day')
        && cur.end.isSameOrAfter(start, 'day')
      )
      || (
        cur.start.isBetween(start, end, 'day', '[]')
        || cur.end.isBetween(start, end, 'day', '[]')
      )
    ) acc.push(cur);
    return acc;
  }, []);
};
