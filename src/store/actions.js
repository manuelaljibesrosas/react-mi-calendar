import { createAction } from 'redux-actions';
import { navigationOrientations } from './constants';

// types
export const SET_RANGE = 'SET_RANGE';
export const SET_CURRENT_DATE = 'SET_CURRENT_DATE';
export const SET_DISPLAY_DATE = 'SET_DISPLAY_DATE';
export const SET_VIEW = 'SET_VIEW';
export const NAVIGATE = 'NAVIGATE';
export const ADD_EVENT = 'ADD_EVENT';
export const UPDATE_EVENT = 'UPDATE_EVENT';
export const REMOVE_EVENT = 'REMOVE_EVENT';
export const ADD_BULK_EVENTS = 'ADD_BULK_EVENTS';
export const GO_BACK = 'GO_BACK';
export const SET_SELECTED_EVENT = 'SET_SELECTED_EVENT';
export const UPDATE_SCROLL_TOP = 'UPDATE_SCROLL_TOP';
export const RESET = 'RESET';

// creators
export const updateScrollTop = createAction(UPDATE_SCROLL_TOP);
export const setRange = createAction(SET_RANGE);
export const setCurrentDate = createAction(SET_CURRENT_DATE);
export const setDisplayDate = createAction(SET_DISPLAY_DATE);
export const setView = createAction(SET_VIEW);
export const addEvent = createAction(ADD_EVENT);
export const updateEvent = createAction(UPDATE_EVENT);
export const removeEvent = createAction(REMOVE_EVENT);
export const addBulkEvents = createAction(ADD_BULK_EVENTS);
export const goBack = createAction(GO_BACK);
export const setSelectedEvent = createAction(SET_SELECTED_EVENT);
export const reset = createAction(RESET);

export const navigate = createAction(NAVIGATE);
export const navigateLeft = () => navigate(navigationOrientations.LEFT);
export const navigateRight = () => navigate(navigationOrientations.RIGHT);
