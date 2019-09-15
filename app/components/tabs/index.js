import React from 'react';
import STYLE from './style.css';
import { Toast } from '../popup/toast';
import { PopupManager } from '../popup/popup-manager';
import { PRIMARY_COLOR_CSS, ThemeContext } from '../themes';

export class Tabs extends React.Component {
  static contextType = ThemeContext;

  constructor(props) {
    super(props);

    this.state = {selectedIndex: 0};
  }

  render() {
    const hasTheme = this.context && this.context.details;
    const backgroundColor = hasTheme ? this.context.details.background : null;
    const fontColor = hasTheme ? this.context.details.color : null;
    const primaryColor = hasTheme ? this.context.details.primaryColor : null;

    let buttons = this.props.tabs.map((tab, i) => {
      if (!this.props.tabs[i].button) return <li key={i} className={STYLE.divider}/>;

      const active = i === this.state.selectedIndex;
      return <li
        key={i}
        className={STYLE.button}
        style={active ? (primaryColor ? {color: PRIMARY_COLOR_CSS} : {'color': '#00BFFF'}) : null}
        onClick={tab.content ? () => this.setState({selectedIndex: i}) : tab.onClick}>
        {tab.button}
      </li>;
    });

    return (
      <div className={STYLE.container} style={hasTheme ? {backgroundColor, color: fontColor, '--primary-color': primaryColor} : null}>
        <ul className={STYLE.nav} style={{position: 'fixed'}}>{buttons}</ul>
        <ul className={STYLE.nav}/>

        <div className={STYLE.content}>
          <Toast/>
          <PopupManager/>

          {this.props.tabs[this.state.selectedIndex].content}
        </div>
      </div>
    );
  }
}
