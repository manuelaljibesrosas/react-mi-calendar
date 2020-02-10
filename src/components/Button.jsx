/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import PropTypes from 'prop-types';

const Button = ({
  label,
  color,
}) => (
  <div
    css={css`
      transition: background 100ms ease;
      height: 45px; width: 150px;
      border-radius: 22px; background: #f5f5f5; color: ${color};
      text-align: center; font-size: 15px; font-weight: 500; line-height: 45px;
      cursor: pointer; user-select: none;

      &:hover {
        background: #ddd;
      }
    `}
  >
    {label}
  </div>
);

Button.defaultProps = {
  color: 'inherit',
};

Button.propTypes = {
  label: PropTypes.string.isRequired,
  color: PropTypes.string,
};

export default Button;
