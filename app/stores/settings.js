import Emitter from '../utilities/emitter';
const localStorage = window['localStorage'];

export const SettingsToggleable = [
  {
    name: 'Expand Notices',
    id: 'expandNotices',
    default: false
  },
  {
    name: 'Load Next Day',
    id: 'loadNextDay',
    default: true
  },
  {
    name: 'Show Breaks',
    id: 'showBreaks',
    default: true
  },
  {
    name: 'Show Assessments',
    id: 'showAssessments',
    default: true
  },
];

class SettingsStoreClass extends Emitter {
  constructor() {
    super();

    for (const setting of SettingsToggleable) {
      const defaultSetting = setting.default || false;
      const storedSetting = localStorage['expandNotices'];
      this[setting.id] = (storedSetting && JSON.parse(storedSetting)) || defaultSetting;
    }

    this.noticesFilter = JSON.parse(localStorage['noticesFilter'] || null); // null, '7', '8', '9', '10', '11', '12', 'Staff'
  }

  update(data) {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        localStorage[key] = JSON.stringify(data[key]);
        this[key] = data[key];
      }
    }

    this.trigger('update');
  }
}

export const SettingsStore = new SettingsStoreClass();
