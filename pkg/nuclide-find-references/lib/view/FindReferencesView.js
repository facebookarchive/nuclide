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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _FileReferencesView2;

function _FileReferencesView() {
  return _FileReferencesView2 = _interopRequireDefault(require('./FileReferencesView'));
}

var _FindReferencesModel2;

function _FindReferencesModel() {
  return _FindReferencesModel2 = _interopRequireDefault(require('../FindReferencesModel'));
}

// Number of files to show on every page.
var PAGE_SIZE = 10;
// Start loading more once the user scrolls within this many pixels of the bottom.
var SCROLL_LOAD_THRESHOLD = 250;

function pluralize(noun, count) {
  return count === 1 ? noun : noun + 's';
}

var FindReferencesView = (function (_React$Component) {
  _inherits(FindReferencesView, _React$Component);

  function FindReferencesView(props) {
    _classCallCheck(this, FindReferencesView);

    _get(Object.getPrototypeOf(FindReferencesView.prototype), 'constructor', this).call(this, props);
    this.state = {
      loading: true,
      fetched: 0,
      selected: -1,
      references: []
    };

    this._fetchMore = this._fetchMore.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._childClick = this._childClick.bind(this);
  }

  _createClass(FindReferencesView, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._fetchMore(PAGE_SIZE);
    }
  }, {
    key: '_fetchMore',
    value: _asyncToGenerator(function* (count) {
      var next = yield this.props.model.getFileReferences(this.state.fetched, PAGE_SIZE);
      this.setState({
        loading: false,
        fetched: this.state.fetched + PAGE_SIZE,
        references: this.state.references.concat(next)
      });
    })
  }, {
    key: '_onScroll',
    value: function _onScroll(evt) {
      var root = (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this.refs.root);
      if (this.state.loading || root.clientHeight >= root.scrollHeight) {
        return;
      }
      var scrollBottom = root.scrollTop + root.clientHeight;
      if (root.scrollHeight - scrollBottom <= SCROLL_LOAD_THRESHOLD) {
        this.setState({ loading: true });
        this._fetchMore(PAGE_SIZE);
      }
    }
  }, {
    key: '_childClick',
    value: function _childClick(i) {
      this.setState({ selected: this.state.selected === i ? -1 : i });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var children = this.state.references.map(function (fileRefs, i) {
        return (_reactForAtom2 || _reactForAtom()).React.createElement((_FileReferencesView2 || _FileReferencesView()).default, _extends({
          key: i,
          isSelected: _this.state.selected === i
        }, fileRefs, {
          basePath: _this.props.model.getBasePath(),
          clickCallback: function () {
            return _this._childClick(i);
          }
        }));
      });

      var refCount = this.props.model.getReferenceCount();
      var fileCount = this.props.model.getFileCount();
      if (this.state.fetched < fileCount) {
        children.push((_reactForAtom2 || _reactForAtom()).React.createElement('div', {
          key: 'loading',
          className: 'nuclide-find-references-loading loading-spinner-medium'
        }));
      }

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-find-references' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-find-references-count panel-heading' },
          refCount,
          ' ',
          pluralize('reference', refCount),
          ' ',
          'found in ',
          fileCount,
          ' ',
          pluralize('file', fileCount),
          ' for',
          ' ',
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'span',
            { className: 'highlight-info' },
            this.props.model.getSymbolName()
          )
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'ul',
          { className: 'nuclide-find-references-files list-tree has-collapsable-children',
            onScroll: this._onScroll, ref: 'root', tabIndex: '0' },
          children
        )
      );
    }
  }]);

  return FindReferencesView;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = FindReferencesView;
module.exports = exports.default;