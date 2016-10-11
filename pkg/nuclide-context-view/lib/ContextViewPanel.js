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

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _nuclideUiPanelComponent;

function _load_nuclideUiPanelComponent() {
  return _nuclideUiPanelComponent = require('../../nuclide-ui/PanelComponent');
}

var _nuclideUiButton;

function _load_nuclideUiButton() {
  return _nuclideUiButton = require('../../nuclide-ui/Button');
}

var _nuclideUiIcon;

function _load_nuclideUiIcon() {
  return _nuclideUiIcon = require('../../nuclide-ui/Icon');
}

/**
 * The Atom panel containing context provider views. This is the sidebar that
 * is rendered in the atom workspace.
 */
var ContextViewPanel = function ContextViewPanel(props) {
  return (_reactForAtom || _load_reactForAtom()).React.createElement(
    (_nuclideUiPanelComponent || _load_nuclideUiPanelComponent()).PanelComponent,
    {
      dock: 'right',
      initialLength: props.initialWidth,
      noScroll: true,
      onResize: props.onResize },
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      'div',
      { style: { display: 'flex', flexDirection: 'column', width: '100%' } },
      (_reactForAtom || _load_reactForAtom()).React.createElement(Header, { onHide: props.onHide, locked: props.locked }),
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-context-view-content' },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'p',
          null,
          'Place your cursor over a symbol to see more information about it.'
        ),
        props.children
      )
    )
  );
};

exports.ContextViewPanel = ContextViewPanel;

var Header = function Header(props) {
  return (_reactForAtom || _load_reactForAtom()).React.createElement(
    'div',
    { className: 'panel-heading', style: { flexShrink: 0 } },
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      'h4',
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        'span',
        null,
        'Context View'
      ),
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'pull-right' },
        props.locked ? (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiIcon || _load_nuclideUiIcon()).Icon, { icon: 'lock' }) : null,
        (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiButton || _load_nuclideUiButton()).Button, { icon: 'x', onClick: props.onHide, title: 'Hide context view' })
      )
    )
  );
};