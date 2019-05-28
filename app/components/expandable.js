import React from 'react';
import ReactDOM from 'react-dom';

export class Expandable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: !!props.initiallyExpanded,
      maxHeight: 'none'
    };

    this._el = React.createRef();
  }

  _setRef = e => {
    if (e) this._el = e;
    this.setHeight()
  };

  render() {
    const {titleComponent, content, ...rest} = this.props;

    return <div {...rest}>
      <div onClick={() => this.setState(({expanded}) => ({expanded: !expanded}))}>{titleComponent}</div>
      <div ref={this._setRef} style={{
        'transition': 'max-height .3s ease',
        'maxHeight': this.state.maxHeight,
        'overflow': 'hidden'
      }}>{content}</div>
    </div>;
  }

  setHeight = () => {
    if (!this._el) return;
    this.setState({maxHeight: (this.state.expanded ? this._el.scrollHeight : 0) + 'px'})
  };

  componentDidMount() {
    this.setHeight()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.expanded !== this.state.expanded) this.setHeight()
  }
}
