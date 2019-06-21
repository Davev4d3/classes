import { TOAST_ACTION_QUEUE, ToastEvents } from './components/popup/toast';

export const SERVICE_WORKER_STATES = {
  UPDATE_AVAILABLE: 'onUpdate',
  INSTALLED: 'onSuccess'
};

const APP_NAME = 'lordhelix';

export const ServiceWorkerNotify = {
  [SERVICE_WORKER_STATES.UPDATE_AVAILABLE]: () => notify('A new version is available. Updates will begin once all ' + APP_NAME + ' tabs are closed.'),
  [SERVICE_WORKER_STATES.INSTALLED]: () => notify('Update complete. ' + APP_NAME + ' is now cached for offline use.')
};

let closeLastPopup = null;

function notify(message) {
  const popup = {
    title: message,
    closeAfter: 5000,
    closeTimeout: 1500,
  };

  if (closeLastPopup) closeLastPopup();
  closeLastPopup = ToastEvents.trigger(TOAST_ACTION_QUEUE, popup, c => {
    closeLastPopup = c
  })
}

if (location.hostname === 'localhost') {
  console.log('notify')
  notify('message1')
  const handler = () => notify('deferred');
  setTimeout(handler, 5000);
  window.h = handler
}