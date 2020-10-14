import styled from 'styled-components/native';
import { Platform } from 'react-native';

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: 0 30px ${Platform.OS === 'android' ? 150 : 40}px;
  position: relative;
`;

export const Title = styled.Text`
  font-size: 24px;
  color: #f4ede8;
  font-family: 'RobotoSlab-Medium';
  margin: 24px 0;
`;

export const Avatar = styled.Image`
  width: 186px;
  height: 186px;
  border-radius: 98px;
  margin-top: 90px;
  align-self: center;
`;
export const BackButton = styled.TouchableOpacity`
  position: absolute;
  left: 24px;
  top: 20px;
`;
export const UserAvatarButton = styled.TouchableOpacity`
  margin-top: 32px;
`;