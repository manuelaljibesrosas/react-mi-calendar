import React from 'react';

const log = (BaseComponent) => (props) => {
  // eslint-disable-next-line no-console
  console.log(`Rendering ${BaseComponent.name}`);
  return <BaseComponent {...props} />;
};

export default log;
