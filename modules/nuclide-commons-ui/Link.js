"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _event() {
  const data = require("../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

/* eslint-env browser */

/**
 * A more accessible abstraction over `<a>`s in Atom, where the default behavior
 * prevents pressing Enter/Return from opening a link. In Atom, the `native-key-bindings`
 * on `<a>`s addresses this, but prevents tabbing to/from these elements.
 *
 * Instead, listen for 'atom:core-confirm' (which by default occurs on Enter/Return)
 * and dispatch a simulated click MouseEvent when these happen. This is not unlike
 * typical browser behavior when Enter/Return is pressed on links, triggering their
 * 'click' event with a simulated MouseEvent.
 */
class Link extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._updateNode = node => {
      this._node = node;
    }, _temp;
  }

  componentDidMount() {
    this._disposable = new (_UniversalDisposable().default)((0, _event().observableFromSubscribeFunction)(cb => atom.commands.add((0, _nullthrows().default)(this._node), 'core:confirm', cb)).subscribe(() => {
      if (this._node == null) {
        return;
      }

      this._node.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
    }));
  }

  componentWillUnmount() {
    if (this._disposable != null) {
      this._disposable.dispose();
    }
  }

  render() {
    return React.createElement("a", Object.assign({}, this.props, {
      ref: this._updateNode
    }));
  }

}

exports.default = Link;