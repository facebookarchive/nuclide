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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _CodeBlock = require('./CodeBlock');

var _CodeBlock2 = _interopRequireDefault(_CodeBlock);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _reactForAtom = require('react-for-atom');

var RecordView = (function (_React$Component) {
  _inherits(RecordView, _React$Component);

  function RecordView() {
    _classCallCheck(this, RecordView);

    _get(Object.getPrototypeOf(RecordView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(RecordView, [{
    key: 'render',
    value: function render() {
      var record = this.props.record;

      var classNames = (0, _classnames2['default'])('nuclide-console-record', 'level-' + (record.level || 'log'), {
        request: record.kind === 'request',
        response: record.kind === 'response'
      });

      var iconName = getIconName(record);
      var icon = iconName ? _reactForAtom.React.createElement('span', { className: 'icon icon-' + iconName }) : null;

      return _reactForAtom.React.createElement(
        'div',
        { className: classNames },
        icon,
        renderContent(record)
      );
    }
  }]);

  return RecordView;
})(_reactForAtom.React.Component);

exports['default'] = RecordView;

function renderContent(record) {
  if (record.kind === 'request') {
    return _reactForAtom.React.createElement(_CodeBlock2['default'], { text: record.text, scopeName: record.scopeName });
  }

  // If there's not text, use a space to make sure the row doesn't collapse.
  var text = record.text || ' ';
  return _reactForAtom.React.createElement(
    'pre',
    null,
    text
  );
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
module.exports = exports['default'];