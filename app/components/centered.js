import React from 'react';

export default function (props) {
  return <div style={{
    'display': 'flex',
    'flexDirection': 'column',
    'alignItems': props.horizontal ? 'center' : null,
    'justifyContent': props.vertical ? 'center' : null,
    'minHeight': '100%',
    'minWidth': '100%',
    'flexGrow': '1'
  }} children={props.children}/>;
}