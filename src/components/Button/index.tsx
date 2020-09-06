import React from 'react';
import { RectButtonProperties } from 'react-native-gesture-handler';

import { Container, ButtonText } from './styles';

interface ButtonProds extends RectButtonProperties {
  children?: string;
}
// eslint-disable-next-line react/prop-types
const Button: React.FC<ButtonProds> = ({ children, ...rest }) => (
  <Container {...rest}>
    <ButtonText>{children}</ButtonText>
  </Container>
);

export default Button;
