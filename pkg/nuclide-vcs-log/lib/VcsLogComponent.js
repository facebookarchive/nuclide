"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _projects() {
  const data = require("../../../modules/nuclide-commons-atom/projects");

  _projects = function () {
    return data;
  };

  return data;
}

var _electron = require("electron");

function _util() {
  const data = require("./util");

  _util = function () {
    return data;
  };

  return data;
}

function _ShowDiff() {
  const data = require("./ShowDiff");

  _ShowDiff = function () {
    return data;
  };

  return data;
}

function _ResizableFlexContainer() {
  const data = require("../../nuclide-ui/ResizableFlexContainer");

  _ResizableFlexContainer = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
class VcsLogComponent extends React.Component {
  constructor(props) {
    super(props);
    this._files = [];

    for (const file of props.files) {
      const projectPath = (0, _projects().getAtomProjectRelativePath)(file);

      if (projectPath != null) {
        this._files.push(projectPath);
      }
    }

    this.state = {
      showDiffContainer: false,
      baseDiffIndex: null,
      targetDiffIndex: null
    };
  }

  render() {
    const {
      logEntries
    } = this.props;

    if (logEntries != null) {
      // Even if the "Show Differential Revision" preference is enabled, only show the column if
      // there is at least one row with a Differential revision. This way, enabling the preference
      // by default should still work fine for non-Differential users.
      let showDifferentialRevision;
      const differentialUrls = [];

      if (this.props.showDifferentialRevision) {
        logEntries.forEach((logEntry, index) => {
          const url = parseDifferentialRevision(logEntry);

          if (url != null) {
            differentialUrls[index] = url;
          }
        });
        showDifferentialRevision = differentialUrls.length > 0;
      } else {
        showDifferentialRevision = false;
      }

      const rows = logEntries.map((logEntry, index) => {
        return this._renderRow(logEntries, index, differentialUrls);
      }); // Note that we use the native-key-bindings/tabIndex=-1 trick to make it possible to
      // copy/paste text from the pane. This has to be applied on a child element of
      // nuclide-vcs-log-scroll-container, or else the native-key-bindings/tabIndex=-1 will
      // interfere with scrolling.

      const logTable = React.createElement("div", {
        className: "nuclide-vcs-log-scroll-container"
      }, React.createElement("div", {
        className: "native-key-bindings",
        tabIndex: "-1"
      }, React.createElement("table", null, React.createElement("tbody", null, React.createElement("tr", null, React.createElement("th", {
        className: "nuclide-vcs-log-header-cell"
      }, "Date"), React.createElement("th", {
        className: "nuclide-vcs-log-header-cell"
      }, "Hash"), showDifferentialRevision ? React.createElement("th", {
        className: "nuclide-vcs-log-header-cell"
      }, "Diff") : null, React.createElement("th", {
        className: "nuclide-vcs-log-header-cell"
      }, "Author"), React.createElement("th", {
        className: "nuclide-vcs-log-header-cell"
      }, "Summary"), React.createElement("th", {
        className: "nuclide-vcs-log-header-cell"
      }, "Show diff")), rows))));

      if (!this.state.showDiffContainer) {
        return logTable;
      } else {
        const filePath = this.props.files[0];
        const {
          oldContent,
          newContent
        } = this.props;
        const props = {
          filePath,
          oldContent,
          newContent
        };
        return (// $FlowFixMe(>=0.53.0) Flow suppress
          React.createElement(_ResizableFlexContainer().ResizableFlexContainer, {
            direction: _ResizableFlexContainer().FlexDirections.VERTICAL,
            className: 'nuclide-vcs-log-container'
          }, React.createElement(_ResizableFlexContainer().ResizableFlexItem, {
            initialFlexScale: 3
          }, React.createElement(_ShowDiff().ShowDiff, props)), React.createElement(_ResizableFlexContainer().ResizableFlexItem, {
            initialFlexScale: 1,
            className: 'nuclide-vcs-log-entries-container'
          }, logTable))
        );
      }
    } else {
      return React.createElement("div", null, React.createElement("div", null, React.createElement("em", null, "Loading hg log ", this._files.join(' '))), React.createElement("div", {
        className: "nuclide-vcs-log-spinner"
      }, React.createElement("div", {
        className: "loading-spinner-large inline-block"
      })));
    }
  }

  _renderRow(logEntries, index, differentialUrls) {
    const showDifferentialRevision = this.props.showDifferentialRevision && differentialUrls.length > 0;
    let differentialCell;

    if (showDifferentialRevision) {
      const url = differentialUrls[index];
      let revision;
      let onClick;

      if (url != null) {
        revision = url.substring(url.lastIndexOf('/') + 1);

        onClick = () => _electron.shell.openExternal(url);
      } else {
        revision = null;
        onClick = null;
      }

      differentialCell = React.createElement("td", {
        className: "nuclide-vcs-log-differential-cell"
      }, React.createElement("span", {
        className: "nuclide-vcs-log-differential-cell-text",
        onClick: onClick
      }, revision));
    } else {
      differentialCell = null;
    }

    const nodeAtIndex = nodeIndex => logEntries[nodeIndex] ? logEntries[nodeIndex].node : '';

    const {
      baseDiffIndex,
      targetDiffIndex
    } = this.state;
    let showDiffCell = null;

    if (this.props.files.length === 1) {
      showDiffCell = React.createElement("span", {
        className: "input-radio-container"
      }, index !== 0 ? React.createElement("input", {
        className: "input-radio",
        type: "radio",
        checked: index === baseDiffIndex,
        disabled: targetDiffIndex != null && index <= targetDiffIndex,
        onChange: () => {
          const newTargetDiffIndex = targetDiffIndex != null ? targetDiffIndex : index - 1;
          this.setState({
            showDiffContainer: true,
            baseDiffIndex: index,
            targetDiffIndex: newTargetDiffIndex
          });
          this.props.onDiffClick(nodeAtIndex(index), nodeAtIndex(newTargetDiffIndex));
        }
      }) : null, index !== logEntries.length - 1 || index === 0 ? React.createElement("input", {
        className: "input-radio right-align",
        type: "radio",
        checked: index === targetDiffIndex,
        disabled: baseDiffIndex != null && index >= baseDiffIndex,
        onChange: () => {
          const newBaseDiffIndex = baseDiffIndex != null ? baseDiffIndex : index + 1;
          this.setState({
            showDiffContainer: true,
            baseDiffIndex: newBaseDiffIndex,
            targetDiffIndex: index
          });
          this.props.onDiffClick(nodeAtIndex(newBaseDiffIndex), nodeAtIndex(index));
        }
      }) : null);
    }

    const logEntry = logEntries[index];
    return React.createElement("tr", {
      key: logEntry.node
    }, React.createElement("td", {
      className: "nuclide-vcs-log-date-cell"
    }, this._toDateString(logEntry.date[0])), React.createElement("td", {
      className: "nuclide-vcs-log-id-cell"
    }, logEntry.node.substring(0, 8)), differentialCell, React.createElement("td", {
      className: "nuclide-vcs-log-author-cell"
    }, (0, _util().shortNameForAuthor)(logEntry.user)), React.createElement("td", {
      className: "nuclide-vcs-log-summary-cell",
      title: logEntry.desc
    }, parseFirstLine(logEntry.desc)), React.createElement("td", {
      className: "nuclide-vcs-log-show-diff-cell"
    }, showDiffCell));
  }

  _toDateString(secondsSince1970) {
    const date = new Date(secondsSince1970 * 1000); // We may want to make date formatting customizable via props.
    // The format of str is "Fri Apr 22 2016 21:32:51 GMT+0100 (BST)".
    // Note that this is date will be displayed in the local time zone of the viewer rather
    // than that of the author of the commit.

    const str = date.toString(); // Strip the day of week from the start of the string and the seconds+TZ from the end.

    const startIndex = str.indexOf(' ') + 1;
    const endIndex = str.lastIndexOf(':');
    return str.substring(startIndex, endIndex);
  }

}

exports.default = VcsLogComponent;

function parseFirstLine(desc) {
  const index = desc.indexOf('\n');

  if (index === -1) {
    return desc;
  } else {
    return desc.substring(0, index);
  }
}

const DIFFERENTIAL_REVISION_RE = /^Differential Revision:\s*(.*)$/im;

function parseDifferentialRevision(logEntry) {
  const {
    desc
  } = logEntry;
  const match = desc.match(DIFFERENTIAL_REVISION_RE);

  if (match != null) {
    return match[1];
  } else {
    return null;
  }
}