"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AppInfoValueCell = void 0;

function _addTooltip() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons-ui/addTooltip"));

  _addTooltip = function () {
    return data;
  };

  return data;
}

function _AtomInput() {
  const data = require("../../../../modules/nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("../constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

class AppInfoValueCell extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      value: props.data.value,
      editingState: 'none',
      editingValue: null
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.state.editingState === 'none') {
      this.setState({
        value: nextProps.data.value
      });
    }
  }

  _updateValue(newValue) {
    const updateFunction = this.props.data.update || (value => Promise.resolve());

    this._setEditingState('syncing');

    return updateFunction(newValue).catch(error => {
      this._setEditingState('error');
    }).then(() => {
      this._setEditingState('syncing', {
        value: newValue
      });
    }).then(() => {
      setTimeout(() => this._setEditingState('none', {
        editingValue: null
      }), UPDATED_DELAY);
    });
  }

  _prepareErrorMessage(error) {
    return error.split(/\n/g).filter(line => line.length > 0).map(line => line.slice(0, MAX_ERROR_LINE_LENGTH)).slice(0, MAX_NUMBER_ERROR_LINES).join('<br>');
  }

  _renderError(error) {
    return React.createElement("span", {
      className: "icon icon-alert" // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
      ,
      ref: (0, _addTooltip().default)({
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
    const newState = Object.assign({}, otherState, {
      editingState
    });
    (0, _nuclideAnalytics().track)(_constants().AnalyticsActions.APPINFOVALUECELL_UI_EDITINGSTATECHANGE, newState);
    this.setState(newState);
  }

  _renderEditableValue(value) {
    const {
      editingState
    } = this.state;
    const editingValue = this.state.editingValue == null ? value : this.state.editingValue;

    if (editingState === 'editing') {
      return React.createElement(_AtomInput().AtomInput, {
        tabIndex: "-1",
        autofocus: true,
        size: "sm",
        defaultValue: value,
        value: editingValue,
        onDidChange: newValue => this.setState({
          editingValue: newValue
        }),
        onBlur: () => this._updateValue(editingValue),
        onConfirm: () => this._updateValue(editingValue)
      });
    } else {
      return React.createElement("div", null, value, React.createElement("span", {
        role: "button",
        tabIndex: "0",
        className: (0, _classnames().default)('icon', 'nuclide-device-panel-app-info-button', 'icon-' + this._getEditingStateIcon(this.state.editingState), {
          'nuclide-device-panel-app-info-button-edit': this.state.editingState === 'none'
        }),
        onClick: () => {
          if (this.state.editingState === 'none') {
            this._setEditingState('editing');
          }
        }
      }));
    }
  }

  render() {
    const {
      canUpdate,
      isError
    } = this.props.data;
    const {
      value
    } = this.state;

    if (isError) {
      (0, _nuclideAnalytics().track)(_constants().AnalyticsActions.APPINFOVALUECELL_UI_ERROR);
      return this._renderError(value);
    }

    if (this.state.editingState === 'none') {
      (0, _nuclideAnalytics().track)(_constants().AnalyticsActions.APPINFOVALUECELL_UI_VALUE);
    }

    if (canUpdate) {
      return this._renderEditableValue(value);
    }

    return value;
  }

}

exports.AppInfoValueCell = AppInfoValueCell;