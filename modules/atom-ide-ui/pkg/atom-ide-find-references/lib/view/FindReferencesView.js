"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _FileReferencesView() {
  const data = _interopRequireDefault(require("./FileReferencesView"));

  _FileReferencesView = function () {
    return data;
  };

  return data;
}

function _FindReferencesModel() {
  const data = _interopRequireDefault(require("../FindReferencesModel"));

  _FindReferencesModel = function () {
    return data;
  };

  return data;
}

function _string() {
  const data = require("../../../../../nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
// Number of files to show on every page.
const PAGE_SIZE = 10; // Start loading more once the user scrolls within this many pixels of the bottom.

const SCROLL_LOAD_THRESHOLD = 250;

class FindReferencesView extends React.Component {
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

  async _fetchMore(count) {
    const next = await this.props.model.getFileReferences(this.state.fetched, PAGE_SIZE);
    this.setState({
      loading: false,
      // TODO: (wbinnssmith) T30771435 this setState depends on current state
      // and should use an updater function rather than an object

      /* eslint-disable react/no-access-state-in-setstate */
      fetched: this.state.fetched + PAGE_SIZE,
      references: this.state.references.concat(next)
      /* eslint-enable react/no-access-state-in-setstate */

    });
  }

  _onScroll(evt) {
    const root = this._root;

    if (!(root != null)) {
      throw new Error("Invariant violation: \"root != null\"");
    }

    if (this.state.loading || root.clientHeight >= root.scrollHeight) {
      return;
    }

    const scrollBottom = root.scrollTop + root.clientHeight;

    if (root.scrollHeight - scrollBottom <= SCROLL_LOAD_THRESHOLD) {
      this.setState({
        loading: true
      });

      this._fetchMore(PAGE_SIZE);
    }
  }

  _childClick(i) {
    // TODO: (wbinnssmith) T30771435 this setState depends on current state
    // and should use an updater function rather than an object
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({
      selected: this.state.selected === i ? -1 : i
    });
  }

  render() {
    const children = this.state.references.map((fileRefs, i) => React.createElement(_FileReferencesView().default, Object.assign({
      key: i,
      isSelected: this.state.selected === i
    }, fileRefs, {
      basePath: this.props.model.getBasePath(),
      clickCallback: () => this._childClick(i)
    })));
    const refCount = this.props.model.getReferenceCount();
    const fileCount = this.props.model.getFileCount();

    if (this.state.fetched < fileCount) {
      children.push(React.createElement("div", {
        key: "loading",
        className: "find-references-loading loading-spinner-medium"
      }));
    }

    return React.createElement("div", {
      className: "find-references"
    }, React.createElement("div", {
      className: "find-references-count panel-heading"
    }, refCount, " ", (0, _string().pluralize)('reference', refCount), " found in ", fileCount, ' ', (0, _string().pluralize)('file', fileCount), " for", ' ', React.createElement("span", {
      className: "highlight-info"
    }, this.props.model.getSymbolName())), React.createElement("ul", {
      className: "find-references-files list-tree has-collapsable-children",
      onScroll: this._onScroll,
      ref: el => {
        this._root = el;
      },
      tabIndex: "0"
    }, children));
  }

}

exports.default = FindReferencesView;