"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../../../nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _CodeSnippet() {
  const data = require("../../../../../nuclide-commons-ui/CodeSnippet");

  _CodeSnippet = function () {
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
class FileReferencesView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: true
    };
    this._onFileClick = this._onFileClick.bind(this);
    this._onFileNameClick = this._onFileNameClick.bind(this);
  }

  _onRefClick(evt, ref) {
    (0, _goToLocation().goToLocation)(this.props.uri, {
      line: ref.range.start.row,
      column: ref.range.start.column
    });
    evt.stopPropagation();
  }

  _onFileClick() {
    this.props.clickCallback();
    this.setState({
      // TODO: (wbinnssmith) T30771435 this setState depends on current state
      // and should use an updater function rather than an object
      // eslint-disable-next-line react/no-access-state-in-setstate
      isExpanded: !this.state.isExpanded
    });
  }

  _onFileNameClick(evt, line) {
    (0, _goToLocation().goToLocation)(this.props.uri, {
      line
    });
    evt.stopPropagation();
  }

  render() {
    const groups = this.props.refGroups.map((group, i) => {
      const firstRef = group.references[0];
      const lastRef = group.references[group.references.length - 1];
      let caller; // flowlint-next-line sketchy-null-string:off

      if (firstRef.name && firstRef.name === lastRef.name) {
        caller = React.createElement("span", null, ' ', "in ", React.createElement("code", null, firstRef.name));
      }

      const startRange = firstRef.range.start;
      const endRange = lastRef.range.end;
      return React.createElement("li", {
        key: group.startLine,
        className: "find-references-ref"
      }, React.createElement("div", {
        className: "find-references-ref-name",
        onClick: evt => this._onRefClick(evt, firstRef)
      }, 'Line ', startRange.row + 1, ":", startRange.column + 1, " - ", endRange.row + 1, ":", endRange.column + 1, caller), React.createElement(_CodeSnippet().CodeSnippet, {
        grammar: this.props.grammar,
        text: this.props.previewText[i],
        highlights: group.references.map(ref => ref.range),
        startLine: group.startLine,
        endLine: group.endLine,
        onClick: evt => this._onRefClick(evt, firstRef),
        onLineClick: this._onFileNameClick
      }));
    });
    const outerClassName = (0, _classnames().default)('find-references-file list-nested-item', {
      collapsed: !this.state.isExpanded,
      expanded: this.state.isExpanded,
      selected: this.props.isSelected
    });
    return React.createElement("li", {
      className: `${outerClassName}`
    }, React.createElement("div", {
      className: "find-references-filename list-item",
      onClick: this._onFileClick
    }, React.createElement("span", {
      className: "icon-file-text icon"
    }), React.createElement("a", {
      onClick: this._onFileNameClick
    }, _nuclideUri().default.relative(this.props.basePath, this.props.uri)), React.createElement("span", {
      className: "find-references-ref-count badge badge-small"
    }, groups.length)), React.createElement("ul", {
      className: "find-references-refs list-tree"
    }, groups));
  }

}

exports.default = FileReferencesView;