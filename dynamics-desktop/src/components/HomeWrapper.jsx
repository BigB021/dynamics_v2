import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import HomePage from './HomePage';
import GuestHomePage from './GuestHomePage';

const HomeWrapper = () => {
  const { token } = useContext(AuthContext);

  return token ? <HomePage /> : <GuestHomePage />;
};

export default HomeWrapper;
