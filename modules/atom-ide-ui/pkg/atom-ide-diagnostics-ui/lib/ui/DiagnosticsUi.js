'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _DiagnosticsView;

function _load_DiagnosticsView() {
  return _DiagnosticsView = _interopRequireDefault(require('./DiagnosticsView'));
}

var _ExperimentalDiagnosticsView;

function _load_ExperimentalDiagnosticsView() {
  return _ExperimentalDiagnosticsView = _interopRequireDefault(require('./ExperimentalDiagnosticsView'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class DiagnosticsUi extends _react.Component {

  constructor() {
    super();
    this.state = {
      uiToShow: null
    };
  }

  componentDidMount() {
    this._configSubscription = (_featureConfig || _load_featureConfig()).default.observeAsStream('atom-ide-diagnostics-ui.useExperimentalUi').subscribe(useExperimentalUi => {
      this.setState({
        uiToShow: Boolean(useExperimentalUi) ? 'EXPERIMENTAL' : 'CLASSIC'
      });
    });
  }

  render() {
    switch (this.state.uiToShow) {
      case null:
        return null;
      case 'CLASSIC':
        return _react.createElement((_DiagnosticsView || _load_DiagnosticsView()).default, this.props);
      case 'EXPERIMENTAL':
        return _react.createElement((_ExperimentalDiagnosticsView || _load_ExperimentalDiagnosticsView()).default, this.props);
    }
  }
}
exports.default = DiagnosticsUi; /**
                                  * Copyright (c) 2017-present, Facebook, Inc.
                                  * All rights reserved.
                                  *
                                  * This source code is licensed under the BSD-style license found in the
                                  * LICENSE file in the root directory of this source tree. An additional grant
                                  * of patent rights can be found in the PATENTS file in the same directory.
                                  *
                                  * 
                                  * @format
                                  */