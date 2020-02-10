import styled from '@emotion/styled';

export const sizes = {
  S: '10px',
};

const TypeFace2 = styled.span`
  color: #999;
  text-transform: uppercase; font-size: ${({ size }) => size};
`;

export default TypeFace2;
