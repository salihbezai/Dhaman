
import React from 'react';
import { Image } from 'react-native';

const Logo = () => {
  return (
    <Image
      source={require('../assets/images/DhamanLogo.png')} // replace with your path
      style={{ width: 100, height: 100, resizeMode: 'contain' }}
    />
  );
};

export default Logo;