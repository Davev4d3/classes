import ReactDOM from 'react-dom';
import React from 'react';

import App from './components/root';
import s from './main.css';

import { register } from './service-worker';
import { ServiceWorkerNotify } from './service-worker-notifications';

ReactDOM.render(<App/>, document.getElementById('app'));

register(ServiceWorkerNotify);