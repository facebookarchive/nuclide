'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _react = _interopRequireWildcard(require('react'));

var _FileReferencesView;

function _load_FileReferencesView() {
  return _FileReferencesView = _interopRequireDefault(require('./FileReferencesView'));
}

var _FindReferencesModel;

function _load_FindReferencesModel() {
  return _FindReferencesModel = _interopRequireDefault(require('../FindReferencesModel'));
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Number of files to show on every page.
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

const PAGE_SIZE = 10;
// Start loading more once the user scrolls within this many pixels of the bottom.
const SCROLL_LOAD_THRESHOLD = 250;

class FindReferencesView extends _react.Component {

  constructor(props) {
    super(props);
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

  componentDidMount() {
    this._fetchMore(PAGE_SIZE);
  }

  _fetchMore(count) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const next = yield _this.props.model.getFileReferences(_this.state.fetched, PAGE_SIZE);
      _this.setState({
        loading: false,
        fetched: _this.state.fetched + PAGE_SIZE,
        references: _this.state.references.concat(next)
      });
    })();
  }

  _onScroll(evt) {
    const root = this._root;

    if (!(root != null)) {
      throw new Error('Invariant violation: "root != null"');
    }

    if (this.state.loading || root.clientHeight >= root.scrollHeight) {
      return;
    }
    const scrollBottom = root.scrollTop + root.clientHeight;
    if (root.scrollHeight - scrollBottom <= SCROLL_LOAD_THRESHOLD) {
      this.setState({ loading: true });
      this._fetchMore(PAGE_SIZE);
    }
  }

  _childClick(i) {
    this.setState({ selected: this.state.selected === i ? -1 : i });
  }

  render() {
    const children = this.state.references.map((fileRefs, i) => _react.createElement((_FileReferencesView || _load_FileReferencesView()).default, Object.assign({
      key: i,
      isSelected: this.state.selected === i
    }, fileRefs, {
      basePath: this.props.model.getBasePath(),
      clickCallback: () => this._childClick(i)
    })));

    const refCount = this.props.model.getReferenceCount();
    const fileCount = this.props.model.getFileCount();
    if (this.state.fetched < fileCount) {
      children.push(_react.createElement('div', {
        key: 'loading',
        className: 'find-references-loading loading-spinner-medium'
      }));
    }

    return _react.createElement(
      'div',
      { className: 'find-references' },
      _react.createElement(
        'div',
        { className: 'find-references-count panel-heading' },
        refCount,
        ' ',
        (0, (_string || _load_string()).pluralize)('reference', refCount),
        ' found in ',
        fileCount,
        ' ',
        (0, (_string || _load_string()).pluralize)('file', fileCount),
        ' for',
        ' ',
        _react.createElement(
          'span',
          { className: 'highlight-info' },
          this.props.model.getSymbolName()
        )
      ),
      _react.createElement(
        'ul',
        {
          className: 'find-references-files list-tree has-collapsable-children',
          onScroll: this._onScroll,
          ref: el => {
            this._root = el;
          },
          tabIndex: '0' },
        children
      )
    );
  }
}
exports.default = FindReferencesView;