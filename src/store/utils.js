export const reduce = (key) => (state, { payload }) => ({
  ...state,
  [key]: payload,
});

export const generateId = () => Math.ceil(Math.random() * 10000);

export const searchEvents = (events, keyword) => events.filter((e) => (
  e.name.toLowerCase().includes(keyword.toLowerCase())
));

export const sortEventsByDate = (a, b) => {
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
};
