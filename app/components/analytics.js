import ReactGA from 'react-ga';
const GA_TRACKING_ID = 'UA-130596833-2';

export function initialiseAnalytics() {
  ReactGA.initialize(GA_TRACKING_ID);
}

export function pageView(pathname) {
  ReactGA.pageview((pathname || window.location.pathname) + window.location.search);
}
