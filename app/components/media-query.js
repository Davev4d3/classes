export class MediaQuery {
  constructor(query, onChange) {
    if (!window.matchMedia) return;

    this._query = window.matchMedia(query[query.length - 1] !== ')' ? '(' + query + ')' : query);
    this._onChangeCallback = onChange;
    this.matches = this._query.matches;
    this._attachEvent();
  }

  _onChange = e => {
    this.matches = e.matches;
    if (this._onChangeCallback && typeof this._onChangeCallback === 'function') this._onChangeCallback(e.matches);
  };

  _attachEvent() {
    this.addEventListener(this._onChange)
  }

  addEventListener(handler) {
    const mql = this._query;
    if (mql.addEventListener) mql.addEventListener('change', handler);
    else if (mql.addListener) mql.addListener(handler);
  }

  removeEventListener(handler) {
    const mql = this._query;
    if (mql.removeEventListener) mql.removeEventListener('change', handler);
    else if (mql.removeListener) mql.removeListener(handler);
  }

  removeEvent() {
    this.removeEventListener(this._onChange);
  }
}
