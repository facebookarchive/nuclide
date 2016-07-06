Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ConsoleView2;

function _ConsoleView() {
  return _ConsoleView2 = _interopRequireDefault(require('./ConsoleView'));
}

var _escapeStringRegexp2;

function _escapeStringRegexp() {
  return _escapeStringRegexp2 = _interopRequireDefault(require('escape-string-regexp'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

/**
 * A component that wraps ConsoleView to handle instance-specific record filtering state.
 */

var Console = (function (_React$Component) {
  _inherits(Console, _React$Component);

  function Console(props) {
    _classCallCheck(this, Console);

    _get(Object.getPrototypeOf(Console.prototype), 'constructor', this).call(this, props);
    this.state = {
      filterText: '',
      enableRegExpFilter: false,
      selectedSourceIds: props.initialSelectedSourceIds
    };
    this._selectSources = this._selectSources.bind(this);
    this._getExecutor = this._getExecutor.bind(this);
    this._updateFilterText = this._updateFilterText.bind(this);
    this._toggleRegExpFilter = this._toggleRegExpFilter.bind(this);
  }

  _createClass(Console, [{
    key: '_getFilterPattern',
    value: function _getFilterPattern(filterText, isRegExp) {
      if (filterText === '') {
        return { pattern: null, isValid: true };
      }
      var source = isRegExp ? filterText : (0, (_escapeStringRegexp2 || _escapeStringRegexp()).default)(filterText);
      try {
        return {
          pattern: new RegExp(source, 'i'),
          isValid: true
        };
      } catch (err) {
        return {
          pattern: null,
          isValid: false
        };
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _getFilterPattern2 = this._getFilterPattern(this.state.filterText, this.state.enableRegExpFilter);

      var pattern = _getFilterPattern2.pattern;
      var isValid = _getFilterPattern2.isValid;

      var records = filterRecords(this.props.records, this.state.selectedSourceIds, pattern, this.props.sources.length !== this.state.selectedSourceIds.length);

      return (_reactForAtom2 || _reactForAtom()).React.createElement((_ConsoleView2 || _ConsoleView()).default, _extends({}, this.props, {
        invalidFilterInput: !isValid,
        records: records,
        enableRegExpFilter: this.state.enableRegExpFilter,
        getProvider: this.props.getProvider,
        selectedSourceIds: this.state.selectedSourceIds,
        selectSources: this._selectSources,
        toggleRegExpFilter: this._toggleRegExpFilter,
        updateFilterText: this._updateFilterText
      }));
    }
  }, {
    key: '_selectSources',
    value: function _selectSources(sourceIds) {
      this.setState({ selectedSourceIds: sourceIds });
    }
  }, {
    key: '_toggleRegExpFilter',
    value: function _toggleRegExpFilter() {
      this.setState({ enableRegExpFilter: !this.state.enableRegExpFilter });
    }
  }, {
    key: '_updateFilterText',
    value: function _updateFilterText(filterText) {
      this.setState({ filterText: filterText });
    }
  }, {
    key: '_getExecutor',
    value: function _getExecutor(id) {
      return this.props.executors.get(id);
    }
  }]);

  return Console;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = Console;

function filterRecords(records, selectedSourceIds, filterPattern, filterSources) {
  if (!filterSources && filterPattern == null) {
    return records;
  }

  return records.filter(function (record) {
    // Only filter regular messages
    if (record.kind !== 'message') {
      return true;
    }

    var sourceMatches = selectedSourceIds.indexOf(record.sourceId) !== -1;
    var filterMatches = filterPattern == null || filterPattern.test(record.text);
    return sourceMatches && filterMatches;
  });
}
module.exports = exports.default;