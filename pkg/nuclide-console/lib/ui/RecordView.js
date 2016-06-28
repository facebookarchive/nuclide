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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _CodeBlock2;

function _CodeBlock() {
  return _CodeBlock2 = _interopRequireDefault(require('./CodeBlock'));
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiLibLazyNestedValueComponent2;

function _nuclideUiLibLazyNestedValueComponent() {
  return _nuclideUiLibLazyNestedValueComponent2 = require('../../../nuclide-ui/lib/LazyNestedValueComponent');
}

var _nuclideUiLibSimpleValueComponent2;

function _nuclideUiLibSimpleValueComponent() {
  return _nuclideUiLibSimpleValueComponent2 = _interopRequireDefault(require('../../../nuclide-ui/lib/SimpleValueComponent'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var RecordView = (function (_React$Component) {
  _inherits(RecordView, _React$Component);

  function RecordView() {
    _classCallCheck(this, RecordView);

    _get(Object.getPrototypeOf(RecordView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(RecordView, [{
    key: '_renderContent',
    value: function _renderContent(record) {
      if (record.kind === 'request') {
        return (_reactForAtom2 || _reactForAtom()).React.createElement((_CodeBlock2 || _CodeBlock()).default, { text: record.text, scopeName: record.scopeName });
      } else if (record.kind === 'response') {
        var sourceId = record.sourceId;

        var simpleValueComponent = (_nuclideUiLibSimpleValueComponent2 || _nuclideUiLibSimpleValueComponent()).default;
        var getProperties = undefined;
        var executor = this.props.getExecutor(sourceId);
        if (executor != null) {
          if (executor.renderValue != null) {
            simpleValueComponent = executor.renderValue;
          }
          getProperties = executor.getProperties;
        }
        return (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibLazyNestedValueComponent2 || _nuclideUiLibLazyNestedValueComponent()).LazyNestedValueComponent, {
          evaluationResult: record.result,
          fetchChildren: getProperties,
          simpleValueComponent: simpleValueComponent,
          shouldCacheChildren: true
        });
      } else if (record.result != null) {
        var provider = this.props.getProvider(record.sourceId);
        (0, (_assert2 || _assert()).default)(provider != null);
        var getProperties = provider.getProperties;
        var renderValue = provider.renderValue;

        var simpleValueComponent = renderValue || (_nuclideUiLibSimpleValueComponent2 || _nuclideUiLibSimpleValueComponent()).default;
        (0, (_assert2 || _assert()).default)(getProperties != null);
        return (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibLazyNestedValueComponent2 || _nuclideUiLibLazyNestedValueComponent()).LazyNestedValueComponent, {
          evaluationResult: record.result,
          fetchChildren: getProperties,
          simpleValueComponent: simpleValueComponent,
          shouldCacheChildren: true
        });
      } else {
        // If there's not text, use a space to make sure the row doesn't collapse.
        var text = record.text || ' ';
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          'pre',
          null,
          text
        );
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var record = this.props.record;

      var classNames = (0, (_classnames2 || _classnames()).default)('nuclide-console-record', 'level-' + (record.level || 'log'), {
        request: record.kind === 'request',
        response: record.kind === 'response'
      });

      var iconName = getIconName(record);
      var icon = iconName ? (_reactForAtom2 || _reactForAtom()).React.createElement('span', { className: 'icon icon-' + iconName }) : null;
      var sourceLabel = this.props.showSourceLabel ? (_reactForAtom2 || _reactForAtom()).React.createElement(
        'span',
        {
          className: 'nuclide-console-record-source-label ' + getHighlightClassName(record.level) },
        record.sourceId
      ) : null;

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: classNames },
        icon,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-console-record-content-wrapper' },
          sourceLabel,
          this._renderContent(record)
        )
      );
    }
  }]);

  return RecordView;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = RecordView;

function getHighlightClassName(level) {
  switch (level) {
    case 'info':
      return 'highlight-info';
    case 'warning':
      return 'highlight-warning';
    case 'error':
      return 'highlight-error';
    default:
      return 'highlight';
  }
}

function getIconName(record) {
  switch (record.kind) {
    case 'request':
      return 'chevron-right';
    case 'response':
      return 'arrow-small-left';
  }
  switch (record.level) {
    case 'info':
      return 'info';
    case 'warning':
      return 'alert';
    case 'error':
      return 'stop';
  }
}
module.exports = exports.default;