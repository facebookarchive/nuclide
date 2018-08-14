"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StatusBarTile = void 0;

var React = _interopRequireWildcard(require("react"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _StatusBarTileComponent() {
  const data = require("./StatusBarTileComponent");

  _StatusBarTileComponent = function () {
    return data;
  };

  return data;
}

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
class StatusBarTile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      result: null,
      pending: false,
      isActive: false
    };
  }

  componentDidMount() {
    if (!(this.subscription == null)) {
      throw new Error("Invariant violation: \"this.subscription == null\"");
    }

    const subscription = this.subscription = new _RxMin.Subscription();
    subscription.add(this.props.results.subscribe(result => this._consumeResult(result)));
    subscription.add(this.props.isActive.subscribe(isActive => this._consumeIsActive(isActive)));
  }

  componentWillUnmount() {
    if (!(this.subscription != null)) {
      throw new Error("Invariant violation: \"this.subscription != null\"");
    }

    this.subscription.unsubscribe();
    this.subscription = null;
    this.setState({
      result: null
    });
  }

  _consumeResult(result) {
    switch (result.kind) {
      case 'not-text-editor':
      case 'no-provider':
      case 'provider-error':
        this.setState({
          result: null
        });
        break;

      case 'pane-change':
      case 'edit':
      case 'save':
        this.setState({
          pending: true
        });
        break;

      case 'result':
        const coverageResult = result.result;
        this.setState({
          result: coverageResult == null ? null : {
            percentage: coverageResult.percentage,
            providerName: result.provider.displayName,
            icon: result.provider.icon
          },
          pending: false
        });
        break;

      default:
        result;
        throw new Error(`Should handle kind ${result.kind}`);
    }
  }

  _consumeIsActive(isActive) {
    this.setState({
      isActive
    });
  }

  render() {
    return React.createElement(_StatusBarTileComponent().StatusBarTileComponent, Object.assign({}, this.state, {
      onClick: this.props.onClick
    }));
  }

}

exports.StatusBarTile = StatusBarTile;