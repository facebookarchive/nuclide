'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WatchView = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _atom = require('atom');

var _react = _interopRequireDefault(require('react'));

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('nuclide-commons-ui/bindObservableAsProps');
}

var _WatchExpressionComponent;

function _load_WatchExpressionComponent() {
  return _WatchExpressionComponent = require('./WatchExpressionComponent');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class WatchView extends _react.default.PureComponent {

  constructor(props) {
    super(props);
    this._watchExpressionComponentWrapped = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(props.model.getWatchExpressionListStore().getWatchExpressions().map(watchExpressions => ({ watchExpressions })), (_WatchExpressionComponent || _load_WatchExpressionComponent()).WatchExpressionComponent);
  }

  render() {
    const { model } = this.props;
    const actions = model.getActions();
    const WatchExpressionComponentWrapped = this._watchExpressionComponentWrapped;

    return _react.default.createElement(
      'div',
      { className: (0, (_classnames || _load_classnames()).default)('nuclide-debugger-container-new') },
      _react.default.createElement(
        'div',
        { className: 'nuclide-debugger-pane-content' },
        _react.default.createElement(WatchExpressionComponentWrapped, {
          onAddWatchExpression: actions.addWatchExpression.bind(model),
          onRemoveWatchExpression: actions.removeWatchExpression.bind(model),
          onUpdateWatchExpression: actions.updateWatchExpression.bind(model),
          watchExpressionStore: model.getWatchExpressionStore()
        })
      )
    );
  }
}
exports.WatchView = WatchView; /**
                                * Copyright (c) 2015-present, Facebook, Inc.
                                * All rights reserved.
                                *
                                * This source code is licensed under the license found in the LICENSE file in
                                * the root directory of this source tree.
                                *
                                * 
                                * @format
                                */