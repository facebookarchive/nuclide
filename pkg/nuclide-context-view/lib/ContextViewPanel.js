'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ContextViewPanel = undefined;

var _reactForAtom = require('react-for-atom');

var _PanelComponent;

function _load_PanelComponent() {
  return _PanelComponent = require('../../nuclide-ui/PanelComponent');
}

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _Icon;

function _load_Icon() {
  return _Icon = require('../../nuclide-ui/Icon');
}

/**
 * The Atom panel containing context provider views. This is the sidebar that
 * is rendered in the atom workspace.
 */
const ContextViewPanel = exports.ContextViewPanel = props => {
  return _reactForAtom.React.createElement(
    (_PanelComponent || _load_PanelComponent()).PanelComponent,
    {
      dock: 'right',
      initialLength: props.initialWidth,
      noScroll: true,
      onResize: props.onResize },
    _reactForAtom.React.createElement(
      'div',
      { style: { display: 'flex', flexDirection: 'column', width: '100%' } },
      _reactForAtom.React.createElement(Header, { onHide: props.onHide, locked: props.locked }),
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-context-view-content' },
        _reactForAtom.React.createElement(
          'p',
          null,
          'Click on a symbol to see more information about it.'
        ),
        props.children
      )
    )
  );
};

const Header = props => {
  return _reactForAtom.React.createElement(
    'div',
    { className: 'panel-heading', style: { flexShrink: 0 } },
    _reactForAtom.React.createElement(
      'h4',
      null,
      _reactForAtom.React.createElement(
        'span',
        null,
        'Context View'
      ),
      _reactForAtom.React.createElement(
        'div',
        { className: 'pull-right' },
        props.locked ? _reactForAtom.React.createElement((_Icon || _load_Icon()).Icon, { icon: 'lock' }) : null,
        _reactForAtom.React.createElement((_Button || _load_Button()).Button, { icon: 'x', onClick: props.onHide, title: 'Hide context view' })
      )
    )
  );
};