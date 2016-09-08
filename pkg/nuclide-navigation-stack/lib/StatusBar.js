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

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../nuclide-ui/lib/Button');
}

var _nuclideUiLibButtonGroup2;

function _nuclideUiLibButtonGroup() {
  return _nuclideUiLibButtonGroup2 = require('../../nuclide-ui/lib/ButtonGroup');
}

var _nuclideUiLibBlock2;

function _nuclideUiLibBlock() {
  return _nuclideUiLibBlock2 = require('../../nuclide-ui/lib/Block');
}

var _nuclideUiLibBindObservableAsProps2;

function _nuclideUiLibBindObservableAsProps() {
  return _nuclideUiLibBindObservableAsProps2 = require('../../nuclide-ui/lib/bindObservableAsProps');
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

  var Tile = (0, (_nuclideUiLibBindObservableAsProps2 || _nuclideUiLibBindObservableAsProps()).bindObservableAsProps)(props, NavStackStatusBarTile);
  (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement(Tile, null), item);
  return new (_atom2 || _atom()).Disposable(function () {
    (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(item);
    statusBarTile.destroy();
  });
}

// $FlowFixMe: `bindObservableAsProps` needs to be typed better.
function NavStackStatusBarTile(props) {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    (_nuclideUiLibBlock2 || _nuclideUiLibBlock()).Block,
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_nuclideUiLibButtonGroup2 || _nuclideUiLibButtonGroup()).ButtonGroup,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibButton2 || _nuclideUiLibButton()).Button, {
        icon: 'chevron-left',
        onClick: props.onBack,
        disabled: !props.enableBack,
        title: 'Navigate Backwards'
      }),
      (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibButton2 || _nuclideUiLibButton()).Button, {
        icon: 'chevron-right',
        onClick: props.onForward,
        disabled: !props.enableForward,
        title: 'Navigate Forwards'
      })
    )
  );
}