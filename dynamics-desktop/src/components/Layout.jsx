import React, { useState, useContext } from 'react';
import VerticalNavbar from './VerticalNavbar';
import { AuthContext } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [isExpanded, setIsExpanded] = useState(true);

  const sidebarWidth = isExpanded ? 224 : 80;

return (
  <div className="flex w-full min-h-screen overflow-hidden">
    {user && <VerticalNavbar onToggle={setIsExpanded} />}
    
    <main
      className="transition-all duration-300 flex-1 overflow-auto"
      style={{
        marginLeft: user ? sidebarWidth : 0,
      }}
    >
      <div className="max-w-full  ">
        {children}
      </div>
    </main>
    </ div>
    
    );
};

export default Layout;
