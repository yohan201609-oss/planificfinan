import React from 'react';
import './SkipLink.css';

const SkipLink: React.FC = React.memo(() => {
  return (
    <a 
      href="#main-content" 
      className="skip-link"
      onFocus={(e) => e.target.classList.add('skip-link-focused')}
      onBlur={(e) => e.target.classList.remove('skip-link-focused')}
    >
      Saltar al contenido principal
    </a>
  );
});

SkipLink.displayName = 'SkipLink';

export default SkipLink;
