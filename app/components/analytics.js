import ReactGA from 'react-ga';

const GA_TRACKING_ID = 'UA-130596833-2';

export function initialiseAnalytics() {
  console.log('analytics initialising');
  ReactGA.initialize(GA_TRACKING_ID);
}

export function pageView(pathname) {
  console.log(`pageview ${pathname}`);
  ReactGA.pageview((pathname || window.location.pathname) + window.location.search);
}

function setDimension(dimensionName, data) {
  ReactGA.set({[dimensionName]: data});
}

export function collectUserGrade(grade) {
  setDimension('dimension1', grade);
}
