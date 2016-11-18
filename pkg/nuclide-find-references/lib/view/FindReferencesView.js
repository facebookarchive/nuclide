'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _reactForAtom = require('react-for-atom');

var _FileReferencesView;

function _load_FileReferencesView() {
  return _FileReferencesView = _interopRequireDefault(require('./FileReferencesView'));
}

var _FindReferencesModel;

function _load_FindReferencesModel() {
  return _FindReferencesModel = _interopRequireDefault(require('../FindReferencesModel'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Number of files to show on every page.
const PAGE_SIZE = 10;
// Start loading more once the user scrolls within this many pixels of the bottom.
const SCROLL_LOAD_THRESHOLD = 250;

function pluralize(noun, count) {
  return count === 1 ? noun : noun + 's';
}

let FindReferencesView = class FindReferencesView extends _reactForAtom.React.Component {

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
    const root = _reactForAtom.ReactDOM.findDOMNode(this.refs.root);
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
    const children = this.state.references.map((fileRefs, i) => _reactForAtom.React.createElement((_FileReferencesView || _load_FileReferencesView()).default, Object.assign({
      key: i,
      isSelected: this.state.selected === i
    }, fileRefs, {
      basePath: this.props.model.getBasePath(),
      clickCallback: () => this._childClick(i)
    })));

    const refCount = this.props.model.getReferenceCount();
    const fileCount = this.props.model.getFileCount();
    if (this.state.fetched < fileCount) {
      children.push(_reactForAtom.React.createElement('div', {
        key: 'loading',
        className: 'nuclide-find-references-loading loading-spinner-medium'
      }));
    }

    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-find-references' },
      _reactForAtom.React.createElement(
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
        _reactForAtom.React.createElement(
          'span',
          { className: 'highlight-info' },
          this.props.model.getSymbolName()
        )
      ),
      _reactForAtom.React.createElement(
        'ul',
        { className: 'nuclide-find-references-files list-tree has-collapsable-children',
          onScroll: this._onScroll, ref: 'root', tabIndex: '0' },
        children
      )
    );
  }
};
exports.default = FindReferencesView;
module.exports = exports['default'];