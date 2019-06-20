import ReactDOM from 'react-dom';
import React from 'react';

import App from './components/app';
import s from './main.css';

import { register } from './serviceWorker';
import { ServiceWorkerNotify } from './service-worker-notifications';

ReactDOM.render(<App/>, document.getElementById('app'));

register(ServiceWorkerNotify);