import React from 'react';
import './Header.css';

const Header = props => {
  return (
    <header id="welcome-section">
      <div className="forest" />
      <div className="silhouette" />
      <div className="moon" />
      <div className="container">
        <h1>
          <span className="line">Hey</span>
          <span className="line">I am Imran 👋</span>
          <span className="line">
            <span className="color">&</span> I code.
          </span>
          
        </h1>
        <div className="buttons">
          <a href="#projects">my portfolio</a>
          <a href="#contact" className="cta">
            get in touch
          </a>
          <span className="line">India</span>
        </div>
        
      </div>
    </header>
  );
};

export default Header;
