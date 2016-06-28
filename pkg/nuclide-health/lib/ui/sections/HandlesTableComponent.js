Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var PropTypes = (_reactForAtom2 || _reactForAtom()).React.PropTypes;

var HandlesTableComponent = (function (_React$Component) {
  _inherits(HandlesTableComponent, _React$Component);

  _createClass(HandlesTableComponent, null, [{
    key: 'propTypes',
    value: {
      title: PropTypes.string,
      handles: PropTypes.arrayOf(PropTypes.object),
      keyed: PropTypes.func.isRequired,
      columns: PropTypes.arrayOf(PropTypes.object).isRequired
    },
    enumerable: true
  }]);

  function HandlesTableComponent(props) {
    _classCallCheck(this, HandlesTableComponent);

    _get(Object.getPrototypeOf(HandlesTableComponent.prototype), 'constructor', this).call(this, props);
    this.previousHandleSummaries = {};
  }

  _createClass(HandlesTableComponent, [{
    key: 'getHandleSummaries',
    value: function getHandleSummaries(handles) {
      var _this = this;

      var handleSummaries = {};
      handles.forEach(function (handle, h) {
        var summarizedHandle = {};
        _this.props.columns.forEach(function (column, c) {
          summarizedHandle[c] = column.value(handle, h);
        });
        handleSummaries[_this.props.keyed(handle, h)] = summarizedHandle;
      });
      return handleSummaries;
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      if (!this.props.handles || Object.keys(this.props.handles).length === 0) {
        return (_reactForAtom2 || _reactForAtom()).React.createElement('div', null);
      }

      var handleSummaries = this.getHandleSummaries(this.props.handles);
      var component = (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'h3',
          null,
          this.props.title
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'table',
          { className: 'table' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'thead',
            null,
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'tr',
              null,
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                'th',
                { width: '10%' },
                'ID'
              ),
              this.props.columns.map(function (column, c) {
                return (_reactForAtom2 || _reactForAtom()).React.createElement(
                  'th',
                  { key: c, width: column.widthPercentage + '%' },
                  column.title
                );
              })
            )
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'tbody',
            null,
            Object.keys(handleSummaries).map(function (key) {
              var handleSummary = handleSummaries[key];
              var previousHandle = _this2.previousHandleSummaries[key];
              return (_reactForAtom2 || _reactForAtom()).React.createElement(
                'tr',
                { key: key, className: previousHandle ? '' : 'nuclide-health-handle-new' },
                (_reactForAtom2 || _reactForAtom()).React.createElement(
                  'th',
                  null,
                  key
                ),
                _this2.props.columns.map(function (column, c) {
                  var className = '';
                  if (previousHandle && previousHandle[c] !== handleSummary[c]) {
                    className = 'nuclide-health-handle-updated';
                  }
                  return (_reactForAtom2 || _reactForAtom()).React.createElement(
                    'td',
                    { key: c, className: className },
                    handleSummary[c]
                  );
                })
              );
            })
          )
        )
      );
      this.previousHandleSummaries = handleSummaries;
      return component;
    }
  }]);

  return HandlesTableComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = HandlesTableComponent;
module.exports = exports.default;