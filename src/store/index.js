import { createStore } from 'redux';
import reducer from './reducer';

const initCalendarStore = (id) => (
  createStore(reducer)
);

const store = createStore(reducer);

export default store;

