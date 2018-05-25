'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AppInfoValueCell = undefined;

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('../../../../modules/nuclide-commons-ui/addTooltip'));
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../../../modules/nuclide-commons-ui/AtomInput');
}

var _react = _interopRequireWildcard(require('react'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../../nuclide-analytics');
}

var _constants;

function _load_constants() {
  return _constants = require('../constants');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

const MAX_ERROR_LINE_LENGTH = 80;
const MAX_NUMBER_ERROR_LINES = 10;
const UPDATED_DELAY = 1000;

class AppInfoValueCell extends _react.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      value: props.data.value,
      editingState: 'none',
      editingValue: null
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.editingState === 'none') {
      this.setState({ value: nextProps.data.value });
    }
  }

  _updateValue(newValue) {
    const updateFunction = this.props.data.update || (value => Promise.resolve());

    this._setEditingState('syncing');
    return updateFunction(newValue).catch(error => {
      this._setEditingState('error');
    }).then(() => {
      this._setEditingState('syncing', { value: newValue });
    }).then(() => {
      setTimeout(() => this._setEditingState('none', { editingValue: null }), UPDATED_DELAY);
    });
  }

  _prepareErrorMessage(error) {
    return error.split(/\n/g).filter(line => line.length > 0).map(line => line.slice(0, MAX_ERROR_LINE_LENGTH)).slice(0, MAX_NUMBER_ERROR_LINES).join('<br>');
  }

  _renderError(error) {
    return _react.createElement('span', {
      className: 'icon icon-alert'
      // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
      , ref: (0, (_addTooltip || _load_addTooltip()).default)({
        title: this._prepareErrorMessage(error),
        delay: 0
      })
    });
  }

  _getEditingStateIcon(editingState) {
    switch (editingState) {
      case 'none':
        return 'pencil';
      case 'syncing':
        return 'sync';
      case 'updated':
        return 'check';
      case 'error':
        return 'alert';
      default:
        return '';
    }
  }

  _setEditingState(editingState, otherState) {
    const newState = Object.assign({}, otherState, { editingState });
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsActions.APPINFOVALUECELL_UI_EDITINGSTATECHANGE, newState);
    this.setState(newState);
  }

  _renderEditableValue(value) {
    const { editingState } = this.state;
    const editingValue = this.state.editingValue == null ? value : this.state.editingValue;

    if (editingState === 'editing') {
      return _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        tabIndex: '-1',
        autofocus: true,
        size: 'sm',
        defaultValue: value,
        value: editingValue,
        onDidChange: newValue => this.setState({ editingValue: newValue }),
        onBlur: () => this._updateValue(editingValue),
        onConfirm: () => this._updateValue(editingValue)
      });
    } else {
      return _react.createElement(
        'div',
        null,
        value,
        _react.createElement('span', {
          role: 'button',
          tabIndex: '0',
          className: (0, (_classnames || _load_classnames()).default)('icon', 'nuclide-device-panel-app-info-button', 'icon-' + this._getEditingStateIcon(this.state.editingState), {
            'nuclide-device-panel-app-info-button-edit': this.state.editingState === 'none'
          }),
          onClick: () => {
            if (this.state.editingState === 'none') {
              this._setEditingState('editing');
            }
          }
        })
      );
    }
  }

  render() {
    const { canUpdate, isError } = this.props.data;
    const { value } = this.state;

    if (isError) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsActions.APPINFOVALUECELL_UI_ERROR);
      return this._renderError(value);
    }

    if (this.state.editingState === 'none') {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsActions.APPINFOVALUECELL_UI_VALUE);
    }

    if (canUpdate) {
      return this._renderEditableValue(value);
    }

    return value;
  }
}
exports.AppInfoValueCell = AppInfoValueCell;