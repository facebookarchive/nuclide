'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.consumeStatusBar = consumeStatusBar;

var _react = _interopRequireWildcard(require('react'));

var _atom = require('atom');

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('nuclide-commons-ui/renderReactRoot');
}

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('nuclide-commons-ui/ButtonGroup');
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('nuclide-commons-ui/bindObservableAsProps');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// Since this is a button which can change the current file, place it where
// it won't change position when the current file name changes, which means way left.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const STATUS_BAR_PRIORITY = -100;

function consumeStatusBar(statusBar, controller) {
  const onBack = () => controller.navigateBackwards();
  const onForward = () => controller.navigateForwards();
  const props = controller.observeStackChanges().map(stack => ({
    enableBack: stack.hasPrevious(),
    enableForward: stack.hasNext(),
    onBack,
    onForward
  }));
  const Tile = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(props, NavStackStatusBarTile);
  const item = (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.createElement(Tile, null));
  item.className = 'nuclide-navigation-stack-tile inline-block';

  const statusBarTile = statusBar.addLeftTile({
    item,
    priority: STATUS_BAR_PRIORITY
  });

  return new _atom.Disposable(() => {
    statusBarTile.destroy();
  });
}

function NavStackStatusBarTile(props) {
  return _react.createElement(
    (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
    { size: 'EXTRA_SMALL' },
    _react.createElement((_Button || _load_Button()).Button, {
      icon: 'chevron-left',
      onClick: props.onBack,
      disabled: !props.enableBack,
      tooltip: {
        title: 'Navigate Backwards',
        keyBindingCommand: 'nuclide-navigation-stack:navigate-backwards'
      }
    }),
    _react.createElement((_Button || _load_Button()).Button, {
      icon: 'chevron-right',
      onClick: props.onForward,
      disabled: !props.enableForward,
      tooltip: {
        title: 'Navigate Forwards',
        keyBindingCommand: 'nuclide-navigation-stack:navigate-forwards'
      }
    })
  );
}