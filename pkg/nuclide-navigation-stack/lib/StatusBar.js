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

exports.consumeStatusBar = consumeStatusBar;

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideUiButton2;

function _nuclideUiButton() {
  return _nuclideUiButton2 = require('../../nuclide-ui/Button');
}

var _nuclideUiButtonGroup2;

function _nuclideUiButtonGroup() {
  return _nuclideUiButtonGroup2 = require('../../nuclide-ui/ButtonGroup');
}

var _nuclideUiBlock2;

function _nuclideUiBlock() {
  return _nuclideUiBlock2 = require('../../nuclide-ui/Block');
}

var _nuclideUiBindObservableAsProps2;

function _nuclideUiBindObservableAsProps() {
  return _nuclideUiBindObservableAsProps2 = require('../../nuclide-ui/bindObservableAsProps');
}

// Since this is a button which can change the current file, place it where
// it won't change position when the current file name changes, which means way left.
var STATUS_BAR_PRIORITY = -100;

function consumeStatusBar(statusBar, controller) {
  var item = document.createElement('div');
  item.className = 'inline-block';

  var statusBarTile = statusBar.addLeftTile({
    item: item,
    priority: STATUS_BAR_PRIORITY
  });

  var onBack = function onBack() {
    return controller.navigateBackwards();
  };
  var onForward = function onForward() {
    return controller.navigateForwards();
  };

  var props = controller.observeStackChanges().map(function (stack) {
    return {
      enableBack: stack.hasPrevious(),
      enableForward: stack.hasNext(),
      onBack: onBack,
      onForward: onForward
    };
  });

  var Tile = (0, (_nuclideUiBindObservableAsProps2 || _nuclideUiBindObservableAsProps()).bindObservableAsProps)(props, NavStackStatusBarTile);
  (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement(Tile, null), item);
  return new (_atom2 || _atom()).Disposable(function () {
    (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(item);
    statusBarTile.destroy();
  });
}

function NavStackStatusBarTile(props) {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    (_nuclideUiBlock2 || _nuclideUiBlock()).Block,
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_nuclideUiButtonGroup2 || _nuclideUiButtonGroup()).ButtonGroup,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiButton2 || _nuclideUiButton()).Button, {
        icon: 'chevron-left',
        onClick: props.onBack,
        disabled: !props.enableBack,
        title: 'Navigate Backwards'
      }),
      (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiButton2 || _nuclideUiButton()).Button, {
        icon: 'chevron-right',
        onClick: props.onForward,
        disabled: !props.enableForward,
        title: 'Navigate Forwards'
      })
    )
  );
}