import styled from '@emotion/styled';

export const sizes = {
  L: '34px',
  M: '28px',
  S: '14px',
  XS: '8px',
};

export default styled.span`
  text-transform: capitalize; font-weight: 400; font-size: ${({ size }) => size}; line-height: 1;
  color: ${({ color }) => color}
`;
