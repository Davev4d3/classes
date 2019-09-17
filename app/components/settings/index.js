import React from 'react';
import s from './style.css';
import Centered from '../centered';
import { Toggle } from '../toggle';
import { SettingsStore, SettingsToggleable } from '../../stores/settings';
import { PRIMARY_COLOR_NAMES, PRIMARY_COLORS, THEMES, useTheme, useThemeSetState } from '../themes';
import { Popup } from '../popover/Popup';

const DarkThemeToggle = props => {
  const themeState = useTheme();
  const themeSetState = useThemeSetState();

  return (
    <div className={s.row}>
      <div className={s.inner__left}>Dark Theme</div>
      <div className={s.inner__right}>
        <Toggle checked={themeState.theme === THEMES.DARK}
                onChange={(newState) => themeSetState({theme: newState ? THEMES.DARK : THEMES.LIGHT})}/>
      </div>
    </div>
  )
};

function ColorPicker(props) {
  const themeState = useTheme();
  const themeSetState = useThemeSetState();

  const accent = {color: themeState.details && themeState.details.accent || null};

  return <div className={s.aboutPopover} style={{background: themeState.theme === THEMES.DARK ? '#4d4d4d' : '#ececec'}}>
    <div className={s.aboutPopoverMeta} style={accent}>Primary Colours</div>
    <div className={s.aboutPopoverSpacer}/>

    <div className={s.colorGrid}>
      {Object.keys(PRIMARY_COLORS).map((v, i) => {
        const color = PRIMARY_COLORS[v];
        return (
          <a className={s.colorGridItemContainer} key={i} onClick={() => {
            console.log(v)
            themeSetState({primaryColor: v});
          }}>
            <div className={s.colorGridItem} style={{background: color}}/>
          </a>
        )
      })}
    </div>

  </div>
}

function PrimaryColorSetting(props) {
  const themeState = useTheme();
  const background = themeState && themeState.details && themeState.details.primaryColor;
  const isDark = themeState && themeState.theme === THEMES.DARK;

  const buttonStyle = {
    borderWidth: isDark ? null : '1px',
    background: background || null
  };

  const toggleColorPicker = <a>
    <div className={s.colorCircle} style={buttonStyle}/>
  </a>;

  return (
    <div className={s.row}>
      <div className={s.inner__left}>Primary Colour</div>
      <div className={s.inner__right}>
        <Popup trigger={toggleColorPicker}>
          {(isOpen, requestClose) => {
            return <ColorPicker/>
          }}
        </Popup>
      </div>
    </div>
  )
}

function AboutPopover(props) {
  const themeState = useTheme();
  const accent = {color: themeState.details.accent};

  return <div className={s.aboutPopover} style={{background: themeState.theme === THEMES.DARK ? '#4d4d4d' : '#ececec'}}>
    <div className={s.aboutPopoverMeta} style={accent}>Made by</div>
    <div className={s.aboutPopoverSpacer}>
      <a href='http://hellodavie.com/' target='_blank' className={s.aboutLink}>Dawei Wu</a>
    </div>
    <div className={s.aboutPopoverMeta} style={accent}>Originally created by</div>
    <div className={s.aboutPopoverSpacer}>Ram Kaniyur</div>

    <div className={s.aboutPopoverMeta} style={accent}>Legal</div>
    <div><a href='/tos' target='_blank' className={s.aboutLink}>Terms</a></div>
  </div>
}

export class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expandNotices: SettingsStore.expandNotices,
      showBreaks: SettingsStore.showBreaks,
      showAssessments: SettingsStore.showAssessments,
      noticesFilter: SettingsStore.noticesFilter,
      loadNextDay: SettingsStore.loadNextDay
    };
  }

  update = () => {
    this.setState({
      expandNotices: SettingsStore.expandNotices,
      showBreaks: SettingsStore.showBreaks,
      showAssessments: SettingsStore.showAssessments,
      noticesFilter: SettingsStore.noticesFilter,
      loadNextDay: SettingsStore.loadNextDay
    });
  };

  static clearData() {
    window['localStorage']['clear']();
    window['location']['reload']();
  }

  componentDidMount() {
    SettingsStore.bind('update', this.update);
  }

  componentWillUnmount() {
    SettingsStore.unbind('update', this.update);
  }

  render() {
    const toggleSettings = SettingsToggleable.map((v, i) => (
      <div className={s.row} key={i}>
        <div className={s.inner__left}>{v.name}</div>
        <div className={s.inner__right}>
          <Toggle
            checked={this.state[v.id]}
            onChange={(newState) => SettingsStore.update({[v.id]: newState})}
          />
        </div>
      </div>
    ));

    const toggleAbout = <a>
      <div className={s.aboutIcon}/>
    </a>;

    return <Centered vertical horizontal>
      <div className={s.settings}>
        <div className={s.rowContainer}>
          <div className={s.row}>
            <div className={s.inner__left}>Classes</div>
            <div className={s.inner__right}>
              <Popup trigger={toggleAbout}>
                {(isOpen, requestClose) => {
                  return <AboutPopover/>
                }}
              </Popup>
            </div>
          </div>

          <DarkThemeToggle/>
          <PrimaryColorSetting/>

          {toggleSettings}

          <div className={s.row}>
            <div className={s.inner__left}>Notices Filter</div>
            <div className={s.inner__right}>
              <select
                onChange={e => SettingsStore.update({noticesFilter: e.target.value || null})}
                value={this.state.noticesFilter}
                className={s.select}>
                <option value=''>All Years</option>
                <option value='7'>Year 7</option>
                <option value='8'>Year 8</option>
                <option value='9'>Year 9</option>
                <option value='10'>Year 10</option>
                <option value='11'>Year 11</option>
                <option value='12'>Year 12</option>
                <option value='Staff'>Staff</option>
              </select>
            </div>
          </div>

          <div className={s.row}>
            <div className={s.inner__left}>Content Settings</div>
            <div className={s.inner__right}>
              <button onClick={this.constructor.clearData}>Clear All Data</button>
            </div>
          </div>
        </div>
      </div>
    </Centered>;
  }
}
