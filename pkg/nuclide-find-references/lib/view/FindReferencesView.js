var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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

var FindReferencesView = (_reactForAtom2 || _reactForAtom()).React.createClass({

  propTypes: {
    model: (_reactForAtom2 || _reactForAtom()).React.PropTypes.instanceOf((_FindReferencesModel2 || _FindReferencesModel()).default).isRequired
  },

  getInitialState: function getInitialState() {
    var references = [];
    return {
      loading: true,
      fetched: 0,
      selected: -1,
      references: references
    };
  },

  componentDidMount: function componentDidMount() {
    this._fetchMore(PAGE_SIZE);
  },

  _fetchMore: _asyncToGenerator(function* (count) {
    var next = yield this.props.model.getFileReferences(this.state.fetched, PAGE_SIZE);
    this.setState({
      loading: false,
      fetched: this.state.fetched + PAGE_SIZE,
      references: this.state.references.concat(next)
    });
  }),

  _onScroll: function _onScroll(evt) {
    var root = (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this.refs.root);
    if (this.state.loading || root.clientHeight >= root.scrollHeight) {
      return;
    }
    var scrollBottom = root.scrollTop + root.clientHeight;
    if (root.scrollHeight - scrollBottom <= SCROLL_LOAD_THRESHOLD) {
      this.setState({ loading: true });
      this._fetchMore(PAGE_SIZE);
    }
  },

  _childClick: function _childClick(i) {
    this.setState({ selected: this.state.selected === i ? -1 : i });
  },

  render: function render() {
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

});

module.exports = FindReferencesView;