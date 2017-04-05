'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _utils;

function _load_utils() {
  return _utils = require('../../nuclide-arcanist-rpc/lib/utils');
}

var _react = _interopRequireDefault(require('react'));

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RevisionTimelineNode extends _react.default.Component {

  constructor(props) {
    super(props);
    this._handlePhabricatorRevisionClick = this._handlePhabricatorRevisionClick.bind(this);
  }

  _handlePhabricatorRevisionClick(event) {
    // Clicking an anchor opens the `href` in the browser. Stop propagation so it doesn't affect
    // the node selection in the Timeline.
    event.stopPropagation();

    const revision = (0, (_utils || _load_utils()).getPhabricatorRevisionFromCommitMessage)(this.props.revision.description);
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-phabricator-diff-open', { revision });
  }

  render() {
    const { revisionStatus, index, revision, revisionsCount, selectedIndex } = this.props;
    const { author, bookmarks, date, description, hash, title } = revision;
    const revisionClassName = (0, (_classnames || _load_classnames()).default)('revision', {
      'selected-revision-inrange': index < selectedIndex - 1,
      'selected-revision-end': index === selectedIndex - 1,
      'selected-revision-last': index === revisionsCount - 2
    });
    const tooltip = `${hash}: ${title}
  Author: ${author}
  Date: ${date.toString()}`;

    const commitAuthor = (0, (_utils || _load_utils()).getCommitAuthorFromAuthorEmail)(author);
    let commitAuthorElement;
    if (commitAuthor != null) {
      commitAuthorElement = _react.default.createElement(
        'span',
        { className: 'inline-block' },
        commitAuthor
      );
    }

    const phabricatorRevision = (0, (_utils || _load_utils()).getPhabricatorRevisionFromCommitMessage)(description);
    let phabricatorRevisionElement;
    if (phabricatorRevision != null) {
      phabricatorRevisionElement = _react.default.createElement(
        'a',
        {
          className: 'inline-block',
          href: phabricatorRevision.url,
          onClick: this._handlePhabricatorRevisionClick },
        _react.default.createElement(
          'strong',
          null,
          phabricatorRevision.name
        )
      );
    }

    let revisionStatusElement;
    if (revisionStatus != null) {
      revisionStatusElement = _react.default.createElement(
        'span',
        { className: (0, (_classnames || _load_classnames()).default)('inline-block', revisionStatus.className) },
        revisionStatus.name
      );
    }

    let associatedExtraElement;
    try {
      // $FlowFB
      const diffUtils = require('../../commons-node/fb-vcs-utils.js');
      const taskIds = diffUtils.getFbCommitTaskInfoFromCommitMessage(description);
      associatedExtraElement = taskIds.map(task => {
        return _react.default.createElement(
          'a',
          { key: task.id, className: 'inline-block', href: task.url },
          task.name
        );
      });
    } catch (ex) {
      // There are no extra UI elements to show.
    }

    const bookmarksToRender = bookmarks.slice();
    if (index === 0 && revisionsCount > 1 && bookmarks.length === 0) {
      bookmarksToRender.push('HEAD');
    }
    if (index === revisionsCount - 1 && bookmarks.length === 0) {
      bookmarksToRender.push('BASE');
    }

    let bookmarksElement;
    if (bookmarksToRender.length > 0) {
      bookmarksElement = _react.default.createElement(
        'span',
        { className: 'inline-block text-success' },
        bookmarksToRender.join(' ')
      );
    }

    return _react.default.createElement(
      'div',
      {
        className: revisionClassName,
        onClick: this.props.onSelectionChange,
        title: tooltip },
      _react.default.createElement('div', { className: 'revision-bubble' }),
      _react.default.createElement(
        'div',
        { className: 'revision-label text-monospace' },
        _react.default.createElement(
          'span',
          { className: 'inline-block' },
          hash.substr(0, 7)
        ),
        commitAuthorElement,
        phabricatorRevisionElement,
        revisionStatusElement,
        associatedExtraElement,
        bookmarksElement,
        _react.default.createElement('br', null),
        _react.default.createElement(
          'span',
          { className: 'revision-title' },
          title
        )
      )
    );
  }
}
exports.default = RevisionTimelineNode; /**
                                         * Copyright (c) 2015-present, Facebook, Inc.
                                         * All rights reserved.
                                         *
                                         * This source code is licensed under the license found in the LICENSE file in
                                         * the root directory of this source tree.
                                         *
                                         * 
                                         */