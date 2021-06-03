import React from 'react';

const SocialLinks = props => {
  return (
    <div className="social">
      <a
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        title="Link to author's Twitter profile"
      >
        {' '}
        <i className="fab fa-twitter" />
      </a>
      <a
        id="profile-link"
        href="https://github.com/the-cross-art"
        target="_blank"
        rel="noopener noreferrer"
        title="Link to author's GitHub Profile"
      >
        {' '}
        <i className="fab fa-github" />
      </a>
      <a
        href="https://www.linkedin.com/in/imran-nazir-692abb112/"
        target="_blank"
        rel="noopener noreferrer"
        title="Link to author's linkedin Profile"
      >
        {' '}
        <i class="fab fa-linkedin-in"></i>
      </a>
    </div>
  );
};

export default SocialLinks;
