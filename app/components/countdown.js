import React from 'react';

export class Countdown extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      text: null
    };

    this._timeout = null;
  }

  componentWillMount() {
    this.tick();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.to !== this.props.to) {
      window.clearTimeout(this._timeout);
      this.tick();
    }
  }

  componentWillUnmount() {
    window.clearTimeout(this._timeout);
  }

  tick = () => {
    let t = this.props.to - Date.now();
    if (t < 0) {
      this.setState({text: 'Yay!'});
      return this.props.onComplete && this.props.onComplete();
    }

    const seconds = Math.floor((t / 1000) % 60),
      minutes = Math.floor((t / (1000 * 60)) % 60),
      hours = Math.floor(t / (1000 * 60 * 60));

    const numbers = [minutes, seconds];
    if (hours !== 0) numbers.unshift(hours);

    this.setState({
      text: numbers.map(n => {
        const s = n.toString();
        const zeroes = Math.max(3 - s.length, 0);
        return Array(zeroes).join('0') + s;
      }).join(':')
    });

    this._timeout = setTimeout(this.tick, 1000)
  }

  render() {
    const {to, onComplete, ...other} = this.props;
    return <div {...other}>{this.state.text}</div>;
  }
}
