import { createStore } from 'redux';
import { openDB } from 'idb';
import reducer from './reducer';
import { addEvent } from './actions';

const store = createStore(reducer);

if (typeof IndexedDB !== 'undefined') {
  openDB('react-mi-calendar', 1, {
    upgrade(db) {
      const events = db.createObjectStore('events', { keyPath: 'id' });
      events.createIndex('start-date', 'start');
    },
  }).then((db) => (
    // iterate over existing events and add them to the Redux store
    db.getAllFromIndex('events', 'start-date')
      .then((events) => events.forEach((e) => (
        store.dispatch(addEvent(e))
      )))
  ));
}

export default store;
