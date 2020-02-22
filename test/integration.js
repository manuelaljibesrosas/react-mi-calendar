import React from 'react';
import TestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {
  toClass,
  createSink,
} from 'recompose';
// components
import {
  Events,
  eventsContainer,
} from '../src/components/organism/Events';
import { addEventContainer } from '../src/components/organism/AddEvent';
import EditEventForm from '../src/components/organism/EditEventForm';

Enzyme.configure({ adapter: new Adapter() });

const mockInputEvent = (value) => ({ target: { value } });

describe('integration', function() {
  beforeEach(cleanStore);
  after(cleanStore);
  describe('AddEvent', function() {
    it(
      'should save an event without name as "untitled event"',
      function() {
        debugger;
        const AddEventClass = toClass(EditEventForm);
        const EnhancedAddEvent = addEventContainer(AddEventClass);
        const wrapper = mount(
          <Provider store={store}>
            <AddEventClass/>
          </Provider>
        );
        console.log(wrapper.find(AddEventClass).props());
        wrapper.find(AddEventClass).invoke('handleDatePickerChange')('from', moment('2020-01-22'));
        wrapper.find(AddEventClass).invoke('handleDatePickerChange')('to', moment('2020-01-23'));
        wrapper.find(AddEventClass).invoke('handleFormSubmit')();
        console.log(store.getState());
      }
    );
  });
  describe('Events', function() {
    it(
      'should provide the ability to load events from prev/next years',
      function() {
        events.forEach(e => store.dispatch(addEvent(e)));
        const EventsClass = toClass(Events);
        const EnhancedEvents = eventsContainer(EventsClass);
        const wrapper = mount(
          <Provider store={store}>
            <EnhancedEvents/>
          </Provider>
        );
        assert(
          Object.keys(wrapper.find(EventsClass).prop('filteredEvents')).length === 1
        );
        wrapper.find(EventsClass).invoke('navigateLeft')();
        assert(
          Object.keys(wrapper.find(EventsClass).prop('filteredEvents')).length === 0
        );
        wrapper.find(EventsClass).invoke('navigateRight')();
        assert(
          Object.keys(wrapper.find(EventsClass).prop('filteredEvents')).length === 1
        );
      }
    );
  });
});

