Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiLibPanelComponent2;

function _nuclideUiLibPanelComponent() {
  return _nuclideUiLibPanelComponent2 = require('../../nuclide-ui/lib/PanelComponent');
}

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../nuclide-ui/lib/Button');
}

var _nuclideUiLibIcon2;

function _nuclideUiLibIcon() {
  return _nuclideUiLibIcon2 = require('../../nuclide-ui/lib/Icon');
}

/**
 * The Atom panel containing context provider views. This is the sidebar that
 * is rendered in the atom workspace.
 */
var ContextViewPanel = function ContextViewPanel(props) {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    (_nuclideUiLibPanelComponent2 || _nuclideUiLibPanelComponent()).PanelComponent,
    {
      dock: 'right',
      initialLength: props.initialWidth,
      noScroll: true,
      onResize: props.onResize },
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      'div',
      { style: { display: 'flex', flexDirection: 'column', width: '100%' } },
      (_reactForAtom2 || _reactForAtom()).React.createElement(Header, { onHide: props.onHide, locked: props.locked }),
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-context-view-content' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'p',
          null,
          'Place your cursor over a function, class, variable, or method in',
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'code',
            null,
            'www'
          ),
          ' to see more information about it.'
        ),
        props.children
      )
    )
  );
};

exports.ContextViewPanel = ContextViewPanel;

var Header = function Header(props) {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    { className: 'panel-heading', style: { flexShrink: 0 } },
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      'h4',
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'span',
        null,
        'Context View'
      ),
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'pull-right' },
        props.locked ? (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibIcon2 || _nuclideUiLibIcon()).Icon, { icon: 'lock' }) : null,
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibButton2 || _nuclideUiLibButton()).Button, { icon: 'x', onClick: props.onHide, title: 'Hide context view' })
      )
    )
  );
};