/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { views } from '../store/constants';
// selectors
import { selectScrollTop } from '../store/selectors';
// actions
import { setView } from '../store/actions';
// components
import RoundShape from './RoundShape';

const addEventButtonContainer = connect(
  (state) => ({
    scrollTop: selectScrollTop(state),
  }),
  (dispatch) => ({
    navigateToAddEventView: () => dispatch(setView(views.ADD_EVENT)),
  }),
);

const AddEventButton = ({
  // state
  scrollTop,
  // actions
  navigateToAddEventView,
}) => (
  <RoundShape
    onClick={navigateToAddEventView}
    tinted="#B3B9C7"
    size="50px"
    style={({
      transform: `translate3d(0, ${scrollTop}px, 0)`,
    })}
    css={css`
      position: absolute; bottom: 15px; right: 15px; 
      cursor: pointer;

      &::before, &::after {
        content: "";
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 18px; height: 1.5px;
        background-color: #fff; border-radius: 2px;
      }
      &:before {
        transform: translate(-50%, -50%) rotate(90deg);
      }
    `}
  />
);

AddEventButton.propTypes = {
  scrollTop: PropTypes.number.isRequired,
  navigateToAddEventView: PropTypes.func.isRequired,
};

export default addEventButtonContainer(AddEventButton);
