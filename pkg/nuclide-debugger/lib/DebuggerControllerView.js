'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _DebuggerStore;

function _load_DebuggerStore() {
  return _DebuggerStore = require('./DebuggerStore');
}

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('nuclide-commons-ui/LoadingSpinner');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function getStateFromStore(store) {
  return {};
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

class DebuggerControllerView extends _react.Component {
  constructor(props) {
    super(props);

    this._updateStateFromStore = store => {
      if (store != null) {
        this.setState(getStateFromStore(store));
      } else {
        this.setState(getStateFromStore(this.props.store));
      }
    };

    this.state = getStateFromStore(props.store);
  }

  componentWillMount() {
    this.setState({
      debuggerStoreChangeListener: this.props.store.onChange(this._updateStateFromStore)
    });
    this._updateStateFromStore();
  }

  componentWillUnmount() {
    const listener = this.state.debuggerStoreChangeListener;
    if (listener != null) {
      listener.dispose();
    }
  }

  componentWillReceiveProps(nextProps) {
    const listener = this.state.debuggerStoreChangeListener;
    if (listener != null) {
      listener.dispose();
    }
    this.setState({
      debuggerStoreChangeListener: nextProps.store.onChange(this._updateStateFromStore)
    });
    this._updateStateFromStore(nextProps.store);
  }

  render() {
    if (this.props.store.getDebuggerMode() === 'starting') {
      return _react.createElement(
        'div',
        { className: 'nuclide-debugger-starting-message' },
        _react.createElement(
          'div',
          null,
          _react.createElement(
            'span',
            { className: 'inline-block' },
            'Starting Debugger...'
          ),
          _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, { className: 'inline-block', size: 'EXTRA_SMALL' })
        )
      );
    }
    return null;
  }

}
exports.default = DebuggerControllerView;