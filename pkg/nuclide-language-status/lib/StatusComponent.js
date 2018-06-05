'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _marked;

function _load_marked() {
  return _marked = _interopRequireDefault(require('marked'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _Button;

function _load_Button() {
  return _Button = require('../../../modules/nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../../modules/nuclide-commons-ui/ButtonGroup');
}

var _Icon;

function _load_Icon() {
  return _Icon = require('../../../modules/nuclide-commons-ui/Icon');
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class StatusComponent extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.props = { serverStatuses: [], editor: null }, this.state = { hovered: false, selectedServerName: null }, this._renderDetails = status => {
      if (status == null || status.data.kind === 'null') {
        return null;
      }
      const { provider, data } = status;
      const header = _react.createElement(
        'h1',
        { className: 'nuclide-language-status-details-heading' },
        provider.name
      );
      const progress = this._renderDetailsProgress(data);
      const message = _react.createElement('div', {
        dangerouslySetInnerHTML: {
          __html: (0, (_marked || _load_marked()).default)(data.message)
        }
      });
      const buttons = this._renderDetailsButtons(status);
      return _react.createElement(
        'div',
        {
          className: (0, (_classnames || _load_classnames()).default)('nuclide-language-status-details', 'nuclide-language-status-details-' + data.kind) },
        header,
        progress,
        message,
        buttons
      );
    }, this._renderDetailsButtons = status => {
      const { provider, data } = status;
      if (data.kind !== 'red' || data.buttons.length === 0) {
        return null;
      }
      return _react.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        null,
        data.buttons.map(b => _react.createElement(
          (_Button || _load_Button()).Button,
          {
            key: b,
            buttonType: (_Button || _load_Button()).ButtonTypes.ERROR,
            onClick: () => provider.clickStatus((0, (_nullthrows || _load_nullthrows()).default)(this.props.editor), data.id || '', b) },
          b
        ))
      );
    }, this._renderDropdownItem = status => {
      const { provider, data } = status;
      // Use icon if present otherwise the first letter of the name, capitalized.
      const icon = provider.icon != null ? _react.createElement((_Icon || _load_Icon()).Icon, { className: 'nuclide-language-status-icon', icon: provider.icon }) : _react.createElement(
        'div',
        null,
        provider.name.substr(0, 1).toUpperCase()
      );
      return _react.createElement(
        'div',
        {
          className: (0, (_classnames || _load_classnames()).default)('nuclide-language-status-dropdown-item', 'nuclide-language-status-dropdown-item-' + data.kind),
          onMouseEnter: () => this.setState({ hovered: true }),
          onMouseLeave: () => this.setState({ hovered: false }),
          onClick: () => {
            if (this.state.selectedServerName === provider.name) {
              this.setState({ selectedServerName: null });
            } else {
              this.setState({ selectedServerName: provider.name });
            }
          } },
        icon
      );
    }, this._renderBar = (status, active) => {
      const { provider, data } = status;
      return _react.createElement('div', {
        key: provider.name,
        style: { height: this.state.hovered ? 16 : 8 },
        className: (0, (_classnames || _load_classnames()).default)('nuclide-language-status-bar', 'nuclide-language-status-bar-' + data.kind + (!active ? '-inactive' : '')),
        onMouseEnter: () => this.setState({ hovered: true }),
        onMouseLeave: () => this.setState({ hovered: false })
      });
    }, _temp;
  }

  render() {
    const serverStatuses = this.props.serverStatuses.filter(status => status.data.kind !== 'null');
    const active = this.state.hovered || this.state.selectedServerName != null;
    const selectedServerStatus = this.props.serverStatuses.find(s => s.provider.name === this.state.selectedServerName);
    return _react.createElement(
      'div',
      { className: 'nuclide-language-status-container' },
      this._renderDetails(selectedServerStatus),
      _react.createElement(
        'div',
        { className: 'nuclide-language-status-bar-and-dropdown-container' },
        _react.createElement(
          'div',
          { className: 'nuclide-language-status-bar-container' },
          serverStatuses.map(status => this._renderBar(status, active))
        ),
        _react.createElement(
          'div',
          {
            // Use opacity instead of visibility so onMouseEnter still triggers
            style: { opacity: active ? 1.0 : 0.0 },
            className: 'nuclide-language-status-dropdown' },
          serverStatuses.map(this._renderDropdownItem)
        )
      )
    );
  }

  _renderDetailsProgress(data) {
    if (data.kind !== 'yellow' || data.fraction == null) {
      return null;
    }
    return _react.createElement(
      'div',
      null,
      'Progress: ',
      (data.fraction * 100).toFixed(2),
      '%'
    );
  }

}
exports.default = StatusComponent; /**
                                    * Copyright (c) 2015-present, Facebook, Inc.
                                    * All rights reserved.
                                    *
                                    * This source code is licensed under the license found in the LICENSE file in
                                    * the root directory of this source tree.
                                    *
                                    * 
                                    * @format
                                    */