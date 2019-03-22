import React from 'react';
import createReactClass from 'create-react-class';

export default createReactClass({
  getInitialState() {
    return {
      text: null,
      timeoutID: null
    };
  },

  tick() {
    let t = this.props.to - Date.now();

    if (t < 0) {
      this.setState({ text: 'Complete!' });
      return this.props.onComplete && this.props.onComplete();
    }

    let seconds = Math.floor( (t/1000) % 60 ),
        minutes = Math.floor( (t/(1000*60)) % 60 ),
        hours = Math.floor( t/(1000*60*60) );

    let numbers = [minutes, seconds];
    if (hours != 0)
      numbers.unshift(hours);

    this.setState({
      text: numbers.map(n => {
        let s = n.toString();
        let zeroes = Math.max(3 - s.length, 0);
        return Array(zeroes).join('0') + s;
      }).join(':'),
      timeoutID: setTimeout(this.tick, 1000)
    });
  },

  componentWillMount() {
    this.tick();
  },

  componentWillReceiveProps(props) {
    if (props.to != this.props.to) {
      window.clearTimeout(this.state.timeoutID);
      this.tick();
    }
  },

  componentWillUnmount() {
    window.clearTimeout(this.state.timeoutID);
  },

  render() {
    return <div {...this.props}>{this.state.text}</div>;
  }
});