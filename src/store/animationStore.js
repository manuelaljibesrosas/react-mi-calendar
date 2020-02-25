import { createStore } from 'redux';
import { createReducer } from 'redux-create-reducer';
import { createAction } from 'redux-actions';

export const animationStatus = {
  INACTIVE: 'INACTIVE',
  TICK: 'TICK',
  COMPLETED: 'COMPLETED',
};

// types
export const NAVIGATE = 'NAVIGATE';

// creators
export const navigate = createAction(NAVIGATE);

const initialState = {
  navigation: {
    status: animationStatus.INACTIVE,
    value: 0,
  },
};

const reducer = createReducer(initialState, {
  [NAVIGATE]: (state, { payload }) => ({
    ...state,
    navigation: payload,
  }),
});

export const animationStore = createStore(reducer);

