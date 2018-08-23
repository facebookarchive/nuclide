"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OutlineViewPanelState = exports.WORKSPACE_VIEW_URI = void 0;

function _bindObservableAsProps() {
  const data = require("../../../../nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _observePaneItemVisibility() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/observePaneItemVisibility"));

  _observePaneItemVisibility = function () {
    return data;
  };

  return data;
}

function _renderReactRoot() {
  const data = require("../../../../nuclide-commons-ui/renderReactRoot");

  _renderReactRoot = function () {
    return data;
  };

  return data;
}

function _OutlineView() {
  const data = require("./OutlineView");

  _OutlineView = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
const WORKSPACE_VIEW_URI = 'atom://nuclide/outline-view';
exports.WORKSPACE_VIEW_URI = WORKSPACE_VIEW_URI;

class OutlineViewPanelState {
  constructor(outlines) {
    this._outlines = outlines;
  }

  destroy() {}

  getTitle() {
    return 'Outline';
  }

  getIconName() {
    return 'list-unordered';
  }

  getPreferredWidth() {
    return 300;
  }

  getURI() {
    return WORKSPACE_VIEW_URI;
  }

  getDefaultLocation() {
    return 'right';
  }

  getElement() {
    const BoundOutlineView = (0, _bindObservableAsProps().bindObservableAsProps)((0, _observePaneItemVisibility().default)(this).switchMap(visible => {
      const outlines = visible ? this._outlines : _RxMin.Observable.of({
        kind: 'empty'
      });
      return outlines.map(outline => ({
        outline,
        visible
      }));
    }), _OutlineView().OutlineView);
    return (0, _renderReactRoot().renderReactRoot)(React.createElement(BoundOutlineView, null));
  }

  serialize() {
    return {
      deserializer: 'atom-ide-ui.OutlineViewPanelState'
    };
  }

}

exports.OutlineViewPanelState = OutlineViewPanelState;