import { css } from '@emotion/core';
import styled from '@emotion/styled';

export const sizes = {
  L: '50px',
};

const base = (size) => css`
  width: ${size}; height: ${size};
  border-radius: 50%;
`;

const border = css`
  border: 1px solid #3f3f3f;
`;

const tint = (color) => css`
  background: ${color}; box-shadow: 0 3px 8px rgba(179, 185, 199, 0.6);
`;

export default styled.div(({ size, bordered, tinted }) => (
  tinted
    ? [base(size), tint(tinted)]
    : bordered
      ? [base(size), border]
      : base(size)
));
