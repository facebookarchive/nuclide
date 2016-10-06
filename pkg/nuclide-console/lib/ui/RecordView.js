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

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiLazyNestedValueComponent2;

function _nuclideUiLazyNestedValueComponent() {
  return _nuclideUiLazyNestedValueComponent2 = require('../../../nuclide-ui/LazyNestedValueComponent');
}

var _nuclideUiSimpleValueComponent2;

function _nuclideUiSimpleValueComponent() {
  return _nuclideUiSimpleValueComponent2 = _interopRequireDefault(require('../../../nuclide-ui/SimpleValueComponent'));
}

var _shallowequal2;

function _shallowequal() {
  return _shallowequal2 = _interopRequireDefault(require('shallowequal'));
}

var _nuclideUiTextRenderer2;

function _nuclideUiTextRenderer() {
  return _nuclideUiTextRenderer2 = require('../../../nuclide-ui/TextRenderer');
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
        // TODO: We really want to use a text editor to render this so that we can get syntax
        // highlighting, but they're just too expensive. Figure out a less-expensive way to get syntax
        // highlighting.
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          'pre',
          null,
          record.text || ' '
        );
      } else if (record.kind === 'response') {
        var executor = this.props.getExecutor(record.sourceId);
        return this._renderNestedValueComponent(record, executor);
      } else if (record.data != null) {
        var provider = this.props.getProvider(record.sourceId);
        return this._renderNestedValueComponent(record, provider);
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
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      return !(0, (_shallowequal2 || _shallowequal()).default)(this.props, nextProps);
    }
  }, {
    key: '_renderNestedValueComponent',
    value: function _renderNestedValueComponent(record, provider) {
      var getProperties = provider == null ? null : provider.getProperties;
      var type = record.data == null ? null : record.data.type;
      var simpleValueComponent = getComponent(type);
      return (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLazyNestedValueComponent2 || _nuclideUiLazyNestedValueComponent()).LazyNestedValueComponent, {
        className: 'nuclide-console-lazy-nested-value',
        evaluationResult: record.data,
        fetchChildren: getProperties,
        simpleValueComponent: simpleValueComponent,
        shouldCacheChildren: true
      });
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
          this._renderContent(record)
        ),
        sourceLabel
      );
    }
  }]);

  return RecordView;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = RecordView;

function getComponent(type) {
  switch (type) {
    case 'text':
      return function (props) {
        return (0, (_nuclideUiTextRenderer2 || _nuclideUiTextRenderer()).TextRenderer)(props.evaluationResult);
      };
    case 'boolean':
    case 'string':
    case 'number':
    case 'object':
    default:
      return (_nuclideUiSimpleValueComponent2 || _nuclideUiSimpleValueComponent()).default;
  }
}

function getHighlightClassName(level) {
  switch (level) {
    case 'info':
      return 'highlight-info';
    case 'success':
      return 'highlight-success';
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
    case 'success':
      return 'check';
    case 'warning':
      return 'alert';
    case 'error':
      return 'stop';
  }
}
module.exports = exports.default;