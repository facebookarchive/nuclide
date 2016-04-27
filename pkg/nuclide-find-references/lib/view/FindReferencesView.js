var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('react-for-atom');

var React = _require.React;
var ReactDOM = _require.ReactDOM;
var PropTypes = React.PropTypes;

var FileReferencesView = require('./FileReferencesView');
var FindReferencesModel = require('../FindReferencesModel');

// Number of files to show on every page.
var PAGE_SIZE = 10;
// Start loading more once the user scrolls within this many pixels of the bottom.
var SCROLL_LOAD_THRESHOLD = 250;

function pluralize(noun, count) {
  return count === 1 ? noun : noun + 's';
}

var FindReferencesView = React.createClass({
  displayName: 'FindReferencesView',

  propTypes: {
    model: PropTypes.instanceOf(FindReferencesModel).isRequired
  },

  getInitialState: function getInitialState() {
    var references = [];
    return {
      loading: true,
      fetched: 0,
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
    var root = ReactDOM.findDOMNode(this.refs.root);
    if (this.state.loading || root.clientHeight >= root.scrollHeight) {
      return;
    }
    var scrollBottom = root.scrollTop + root.clientHeight;
    if (root.scrollHeight - scrollBottom <= SCROLL_LOAD_THRESHOLD) {
      this.setState({ loading: true });
      this._fetchMore(PAGE_SIZE);
    }
  },

  render: function render() {
    var _this = this;

    var children = this.state.references.map(function (fileRefs, i) {
      return React.createElement(FileReferencesView, _extends({
        key: i
      }, fileRefs, {
        basePath: _this.props.model.getBasePath()
      }));
    });

    var refCount = this.props.model.getReferenceCount();
    var fileCount = this.props.model.getFileCount();
    if (this.state.fetched < fileCount) {
      children.push(React.createElement('div', {
        key: 'loading',
        className: 'nuclide-find-references-loading loading-spinner-medium'
      }));
    }

    return React.createElement(
      'div',
      { className: 'nuclide-find-references', onScroll: this._onScroll, ref: 'root', tabIndex: '0' },
      React.createElement(
        'div',
        { className: 'nuclide-find-references-count' },
        'Found ',
        refCount,
        ' ',
        pluralize('reference', refCount),
        ' ',
        'in ',
        fileCount,
        ' ',
        pluralize('file', fileCount),
        '.'
      ),
      children
    );
  }

});

module.exports = FindReferencesView;