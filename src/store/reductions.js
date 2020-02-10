// flattens an object of the form:
//  {
//    key: Array<T>
//    key2: Array<T>
//    ..etc
//  }
//  to a single array of T with
//  all of the object values concatenated
export const flattenObjectOfArrayValues = (obj) => Object.values(obj).flat();

export const searchEvents = (events, keyword) => events.filter((e) => (
  e.name.toLowerCase().includes(keyword.toLowerCase())
));

export const findEventByKey = (key, value, events) => flattenObjectOfArrayValues(events)
  .filter((e) => e[key] === value).pop();

export const findPathToEvent = (events, eventId) => {
  const path = [];

  for (const event in events) {
    if (Object.prototype.hasOwnProperty.call(events, event)) {
      const index = events[event].findIndex(({ id }) => id === eventId);
      if (index >= 0) {
        path.push(event);
        path.push(index);
        break;
      }
    }
  }
  return path;
};

export const retrieveElementFromPath = (path, arr) => {
  let result;

  for (let i = 0; i < path.length; i++) {
    if (typeof result === 'undefined') {
      result = arr[path[i]];
      continue;
    }
    result = result[path[i]];
  }
  return result;
};
