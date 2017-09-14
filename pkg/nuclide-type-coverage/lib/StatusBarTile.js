'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StatusBarTile = undefined;

var _react = _interopRequireWildcard(require('react'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _StatusBarTileComponent;

function _load_StatusBarTileComponent() {
  return _StatusBarTileComponent = require('./StatusBarTileComponent');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class StatusBarTile extends _react.Component {

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
      throw new Error('Invariant violation: "this.subscription == null"');
    }

    const subscription = this.subscription = new _rxjsBundlesRxMinJs.Subscription();
    subscription.add(this.props.results.subscribe(result => this._consumeResult(result)));
    subscription.add(this.props.isActive.subscribe(isActive => this._consumeIsActive(isActive)));
  }

  componentWillUnmount() {
    if (!(this.subscription != null)) {
      throw new Error('Invariant violation: "this.subscription != null"');
    }

    this.subscription.unsubscribe();
    this.subscription = null;
    this.setState({ result: null });
  }

  _consumeResult(result) {
    switch (result.kind) {
      case 'not-text-editor':
      case 'no-provider':
      case 'provider-error':
        this.setState({ result: null });
        break;
      case 'pane-change':
      case 'edit':
      case 'save':
        this.setState({ pending: true });
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
        throw new Error(`Should handle kind ${result.kind}`);
    }
  }

  _consumeIsActive(isActive) {
    this.setState({ isActive });
  }

  render() {
    return _react.createElement((_StatusBarTileComponent || _load_StatusBarTileComponent()).StatusBarTileComponent, Object.assign({}, this.state, { onClick: this.props.onClick }));
  }
}
exports.StatusBarTile = StatusBarTile; /**
                                        * Copyright (c) 2015-present, Facebook, Inc.
                                        * All rights reserved.
                                        *
                                        * This source code is licensed under the license found in the LICENSE file in
                                        * the root directory of this source tree.
                                        *
                                        * 
                                        * @format
                                        */