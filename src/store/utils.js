import { isBefore } from 'date-fns/fp';

export const reduce = (key) => (state, { payload }) => ({
  ...state,
  [key]: payload,
});

export const generateId = () => Math.ceil(Math.random() * 10000);

export const searchEvents = (events, keyword) => events.filter((e) => (
  e.name.toLowerCase().includes(keyword.toLowerCase())
));

export const sortEvents = (events) => [].concat(events).sort((a, b) => (
  isBefore(a.start)(b.start) ? 1 : -1
));
