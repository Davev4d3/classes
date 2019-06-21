import { TOAST_ACTION_QUEUE, ToastEvents } from './components/popup/toast';

export const SERVICE_WORKER_STATES = {
  UPDATE_AVAILABLE: 'onUpdate',
  INSTALLED: 'onSuccess'
};

const APP_NAME = 'lordhelix';

export const ServiceWorkerNotify = {
  [SERVICE_WORKER_STATES.UPDATE_AVAILABLE]: () => notify('A new version is available. Updates will begin once all ' + APP_NAME + ' tabs are closed.'),
  [SERVICE_WORKER_STATES.INSTALLED]: () => notify('Background updates complete — ' + APP_NAME + ' is now ready for offline use.')
};

let closeLastPopup = null;

function notify(message) {
  const popup = {
    title: message,
    closeAfter: 15000,
    closeTimeout: 500,
  };

  if (closeLastPopup) closeLastPopup();
  closeLastPopup = ToastEvents.trigger(TOAST_ACTION_QUEUE, popup, c => {
    closeLastPopup = c
  })
}
