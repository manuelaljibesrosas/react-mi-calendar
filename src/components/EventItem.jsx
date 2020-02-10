/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import PropTypes from 'prop-types';
// components
import RoundedBox from './RoundedBox';
import TypeFaceSansSerif from './TypeFaceSansSerif';

const EventItem = ({
  // state
  name,
  duration,
  location,
  // actions
  onClick,
}) => (
  <RoundedBox
    onClick={onClick}
    css={css`
      cursor: pointer;
    `}
  >
    <div
      css={css`
        display: flex; flex-direction: column;
      `}
    >
      <TypeFaceSansSerif size="14px">{name}</TypeFaceSansSerif>
      <div
        css={css`
          margin-bottom: 2px;
        `}
      />
      <TypeFaceSansSerif size="13px">{duration}</TypeFaceSansSerif>
      {
        location
        && (
          <TypeFaceSansSerif size="13px">
            {` | ${location}`}
          </TypeFaceSansSerif>
        )
      }
    </div>
  </RoundedBox>
);

EventItem.defaultProps = {
  duration: '',
  location: '',
};

EventItem.propTypes = {
  name: PropTypes.string.isRequired,
  duration: PropTypes.string,
  location: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

export default EventItem;
