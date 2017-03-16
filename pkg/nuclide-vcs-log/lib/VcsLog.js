'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

var _projects;

function _load_projects() {
  return _projects = require('../../commons-atom/projects');
}

var _electron = require('electron');

var _util;

function _load_util() {
  return _util = require('./util');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class VcsLog extends _react.default.Component {

  constructor(props) {
    super(props);
    this._files = [];
    for (const file of props.files) {
      const projectPath = (0, (_projects || _load_projects()).getAtomProjectRelativePath)(file);
      if (projectPath != null) {
        this._files.push(projectPath);
      }
    }

    this.state = {
      logEntries: null
    };
  }

  render() {
    const { logEntries } = this.state;
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
          differentialCell = _react.default.createElement(
            'td',
            { className: 'nuclide-vcs-log-differential-cell' },
            _react.default.createElement(
              'span',
              { className: 'nuclide-vcs-log-differential-cell-text', onClick: onClick },
              revision
            )
          );
        } else {
          differentialCell = null;
        }

        return _react.default.createElement(
          'tr',
          { key: logEntry.node },
          _react.default.createElement(
            'td',
            { className: 'nuclide-vcs-log-date-cell' },
            this._toDateString(logEntry.date[0])
          ),
          _react.default.createElement(
            'td',
            { className: 'nuclide-vcs-log-id-cell' },
            logEntry.node.substring(0, 8)
          ),
          differentialCell,
          _react.default.createElement(
            'td',
            { className: 'nuclide-vcs-log-author-cell' },
            (0, (_util || _load_util()).shortNameForAuthor)(logEntry.user)
          ),
          _react.default.createElement(
            'td',
            { className: 'nuclide-vcs-log-summary-cell', title: logEntry.desc },
            parseFirstLine(logEntry.desc)
          )
        );
      });

      // Note that we use the native-key-bindings/tabIndex=-1 trick to make it possible to
      // copy/paste text from the pane. This has to be applied on a child element of
      // nuclide-vcs-log-scroll-container, or else the native-key-bindings/tabIndex=-1 will
      // interfere with scrolling.
      return _react.default.createElement(
        'div',
        { className: 'nuclide-vcs-log-scroll-container' },
        _react.default.createElement(
          'div',
          { className: 'native-key-bindings', tabIndex: '-1' },
          _react.default.createElement(
            'table',
            null,
            _react.default.createElement(
              'tbody',
              null,
              _react.default.createElement(
                'tr',
                null,
                _react.default.createElement(
                  'th',
                  { className: 'nuclide-vcs-log-header-cell' },
                  'Date'
                ),
                _react.default.createElement(
                  'th',
                  { className: 'nuclide-vcs-log-header-cell' },
                  'ID'
                ),
                showDifferentialRevision ? _react.default.createElement(
                  'th',
                  { className: 'nuclide-vcs-log-header-cell' },
                  'Revision'
                ) : null,
                _react.default.createElement(
                  'th',
                  { className: 'nuclide-vcs-log-header-cell' },
                  'Author'
                ),
                _react.default.createElement(
                  'th',
                  { className: 'nuclide-vcs-log-header-cell' },
                  'Summary'
                )
              ),
              rows
            )
          )
        )
      );
    } else {
      return _react.default.createElement(
        'div',
        null,
        _react.default.createElement(
          'div',
          null,
          _react.default.createElement(
            'em',
            null,
            'Loading hg log ',
            this._files.join(' ')
          )
        ),
        _react.default.createElement(
          'div',
          { className: 'nuclide-vcs-log-spinner' },
          _react.default.createElement('div', { className: 'loading-spinner-large inline-block' })
        )
      );
    }
  }

  _toDateString(secondsSince1970) {
    const date = new Date(secondsSince1970 * 1000);

    // We may want to make date formatting customizable via props.
    // The format of str is "Fri Apr 22 2016 21:32:51 GMT+0100 (BST)".
    // Note that this is date will be displayed in the local time zone of the viewer rather
    // than that of the author of the commit.
    const str = date.toString();

    // Strip the day of week from the start of the string and the seconds+TZ from the end.
    const startIndex = str.indexOf(' ') + 1;
    const endIndex = str.lastIndexOf(':');
    return str.substring(startIndex, endIndex);
  }
}

exports.default = VcsLog;
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
  const { desc } = logEntry;
  const match = desc.match(DIFFERENTIAL_REVISION_RE);
  if (match != null) {
    return match[1];
  } else {
    return null;
  }
}