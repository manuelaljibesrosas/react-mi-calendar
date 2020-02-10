export const reduce = (key) => (state, { payload }) => ({
  ...state,
  [key]: payload,
});

export const generateId = () => Math.ceil(Math.random() * 10000);

export const getFormattedDateFromMoment = (m) => `${m.get('Y')}-${(m.get('M') + 1).toString().padStart(2, '0')}-${m.get('D')}`;

export const differenceBetweenMomentDates = (d1, d2) => (
  Math.floor((d2.toDate().getTime() - d1.toDate().getTime()) / 1000 / 60 / 60 / 24)
);

// subtract number of milliseconds from each date and convert them to days
export const daysThatEventSpans = ({ start, end }) => differenceBetweenMomentDates(start, end);
