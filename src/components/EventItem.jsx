/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import PropTypes from 'prop-types';
// components
import RoundedBox from './RoundedBox';
import TypeFaceSansSerif from './TypeFaceSansSerif';

const EventItem = ({
  // state
  name,
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
      <div
        css={css`
          margin-bottom: ${(location) ? '4' : '0'}px;
        `}
      >
        <TypeFaceSansSerif size="14px">{name}</TypeFaceSansSerif>
      </div>
      {
        (location)
        && (
          <div
            css={css`
              display: flex; align-items: center;
            `}
          >
            <div
              css={css`
                margin-right: 8px;
                width: 6px; height 6px;
                border-radius: 50%; background: green;
              `}
            />
            <TypeFaceSansSerif size="13px">
              {location}
            </TypeFaceSansSerif>
          </div>
        )
      }
    </div>
  </RoundedBox>
);

EventItem.defaultProps = {
  location: '',
};

EventItem.propTypes = {
  name: PropTypes.string.isRequired,
  location: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

export default EventItem;
