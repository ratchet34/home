import React from "react";
import PropTypes from "prop-types";

const UserAgentDetector = ({ Desktop, Mobile }) => {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  return isMobile === true ? <Mobile /> : <Desktop />;
};

UserAgentDetector.propTypes = {
  Desktop: PropTypes.elementType.isRequired,
  Mobile: PropTypes.elementType.isRequired,
};

export default UserAgentDetector;
