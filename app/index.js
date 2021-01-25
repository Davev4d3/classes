import ReactDOM from 'react-dom';
import React from 'react';

import App from './components/root';
import s from './main.css';

import { register } from './service-worker';
import { ServiceWorkerNotify } from './service-worker-notifications';

ReactDOM.render(<App/>, document.getElementById('app'));

register(ServiceWorkerNotify);


console.log("%cManaged by David - @hellodavie", "background: #282a30; color: #ffb86e; line-height: 24px; padding: 8px 16px;")
console.log("%cContact https://hellodavie.com/ to contribute or take over lordhelix", "background: #282a30; color: #89c4f4; line-height: 24px; padding: 8px 16px;")
