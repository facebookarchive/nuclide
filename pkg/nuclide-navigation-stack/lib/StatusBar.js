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

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _nuclideUiButton;

function _load_nuclideUiButton() {
  return _nuclideUiButton = require('../../nuclide-ui/Button');
}

var _nuclideUiButtonGroup;

function _load_nuclideUiButtonGroup() {
  return _nuclideUiButtonGroup = require('../../nuclide-ui/ButtonGroup');
}

var _nuclideUiBlock;

function _load_nuclideUiBlock() {
  return _nuclideUiBlock = require('../../nuclide-ui/Block');
}

var _nuclideUiBindObservableAsProps;

function _load_nuclideUiBindObservableAsProps() {
  return _nuclideUiBindObservableAsProps = require('../../nuclide-ui/bindObservableAsProps');
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

  var Tile = (0, (_nuclideUiBindObservableAsProps || _load_nuclideUiBindObservableAsProps()).bindObservableAsProps)(props, NavStackStatusBarTile);
  (_reactForAtom || _load_reactForAtom()).ReactDOM.render((_reactForAtom || _load_reactForAtom()).React.createElement(Tile, null), item);
  return new (_atom || _load_atom()).Disposable(function () {
    (_reactForAtom || _load_reactForAtom()).ReactDOM.unmountComponentAtNode(item);
    statusBarTile.destroy();
  });
}

function NavStackStatusBarTile(props) {
  return (_reactForAtom || _load_reactForAtom()).React.createElement(
    (_nuclideUiBlock || _load_nuclideUiBlock()).Block,
    null,
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_nuclideUiButtonGroup || _load_nuclideUiButtonGroup()).ButtonGroup,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiButton || _load_nuclideUiButton()).Button, {
        icon: 'chevron-left',
        onClick: props.onBack,
        disabled: !props.enableBack,
        title: 'Navigate Backwards'
      }),
      (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiButton || _load_nuclideUiButton()).Button, {
        icon: 'chevron-right',
        onClick: props.onForward,
        disabled: !props.enableForward,
        title: 'Navigate Forwards'
      })
    )
  );
}