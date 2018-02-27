'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('nuclide-commons-ui/LoadingSpinner');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function getStateFromModel(model) {
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

    this._updateStateFromModel = model => {
      if (model != null) {
        this.setState(getStateFromModel(model));
      } else {
        this.setState(getStateFromModel(this.props.model));
      }
    };

    this.state = getStateFromModel(props.model);
  }

  componentWillMount() {
    this.setState({
      debuggerModelChangeListener: this.props.model.onChange(this._updateStateFromModel)
    });
    this._updateStateFromModel();
  }

  componentWillUnmount() {
    const listener = this.state.debuggerModelChangeListener;
    if (listener != null) {
      listener.dispose();
    }
  }

  componentWillReceiveProps(nextProps) {
    const listener = this.state.debuggerModelChangeListener;
    if (listener != null) {
      listener.dispose();
    }
    this.setState({
      debuggerModelChangeListener: nextProps.model.onChange(this._updateStateFromModel)
    });
    this._updateStateFromModel(nextProps.model);
  }

  render() {
    if (this.props.model.getDebuggerMode() === 'starting') {
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