"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.consumeStatusBar = consumeStatusBar;

var React = _interopRequireWildcard(require("react"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _renderReactRoot() {
  const data = require("../../../modules/nuclide-commons-ui/renderReactRoot");

  _renderReactRoot = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("../../../modules/nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _ButtonGroup() {
  const data = require("../../../modules/nuclide-commons-ui/ButtonGroup");

  _ButtonGroup = function () {
    return data;
  };

  return data;
}

function _bindObservableAsProps() {
  const data = require("../../../modules/nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _shallowequal() {
  const data = _interopRequireDefault(require("shallowequal"));

  _shallowequal = function () {
    return data;
  };

  return data;
}

function analytics() {
  const data = _interopRequireWildcard(require("../../nuclide-analytics"));

  analytics = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
// Since this is a button which can change the current file, place it where
// it won't change position when the current file name changes, which means way left.
const STATUS_BAR_PRIORITY = -100;

function consumeStatusBar(statusBar, navigationStackServices) {
  const props = navigationStackServices.switchMap(navigationStack => {
    if (navigationStack == null) {
      return _RxMin.Observable.of({
        available: false
      });
    }

    const onBack = () => {
      analytics().track('status-bar-nav-stack-clicked-back');
      navigationStack.navigateBackwards();
    };

    const onForward = () => {
      analytics().track('status-bar-nav-stack-clicked-forward');
      navigationStack.navigateForwards();
    };

    return (0, _event().observableFromSubscribeFunction)(navigationStack.subscribe).map(stack => ({
      available: true,
      enableBack: stack.hasPrevious,
      enableForward: stack.hasNext,
      onBack,
      onForward
    }));
  }).distinctUntilChanged(_shallowequal().default);
  const Tile = (0, _bindObservableAsProps().bindObservableAsProps)(props, NavStackStatusBarTile);
  const item = (0, _renderReactRoot().renderReactRoot)(React.createElement(Tile, null));
  item.className = 'nuclide-navigation-stack-tile inline-block';
  const statusBarTile = statusBar.addLeftTile({
    item,
    priority: STATUS_BAR_PRIORITY
  });
  return new (_UniversalDisposable().default)(() => {
    statusBarTile.destroy();
  });
}

class NavStackStatusBarTile extends React.Component {
  render() {
    if (!this.props.available) {
      return null;
    }

    return React.createElement(_ButtonGroup().ButtonGroup, {
      size: "EXTRA_SMALL"
    }, React.createElement(_Button().Button, {
      icon: "chevron-left",
      onClick: this.props.onBack,
      disabled: !this.props.enableBack,
      tooltip: {
        title: 'Go Back',
        keyBindingCommand: 'nuclide-navigation-stack:navigate-backwards'
      },
      className: "nuclide-navigation-stack-button"
    }), React.createElement(_Button().Button, {
      icon: "chevron-right",
      onClick: this.props.onForward,
      disabled: !this.props.enableForward,
      tooltip: {
        title: 'Go Forward',
        keyBindingCommand: 'nuclide-navigation-stack:navigate-forwards'
      },
      className: "nuclide-navigation-stack-button"
    }));
  }

}