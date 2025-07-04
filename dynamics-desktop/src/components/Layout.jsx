import React, { useState, useContext } from 'react';
import VerticalNavbar from './VerticalNavbar';
import { AuthContext } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [isExpanded, setIsExpanded] = useState(true);

  const sidebarWidth = isExpanded ? 224 : 80;

  return (
    <div className="flex">
      {user && <VerticalNavbar onToggle={setIsExpanded} />}

      <main
        className="transition-all duration-300 w-full"
        style={{
          marginLeft: user ? sidebarWidth : 0,
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
