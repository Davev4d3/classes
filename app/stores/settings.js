import Emitter from '../utilities/emitter';

let localStorage = window['localStorage'];

class SettingsStore extends Emitter {
  constructor() {
    super();

    this.expandNotices = JSON.parse(localStorage.expandNotices || false); // true, false
    this.noticesFilter = JSON.parse(localStorage.noticesFilter || null); // null, '7', '8', '9', '10', '11', '12', 'Staff'
  }

  update(data) {
    for (let key in data) {
      localStorage[key] = JSON.stringify(data[key]);
      this[key] = data[key];
    }

    this.trigger('update');
  }
}

export default new SettingsStore();