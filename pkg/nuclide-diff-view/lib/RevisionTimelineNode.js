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

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _utils;

function _load_utils() {
  return _utils = require('../../nuclide-arcanist-rpc/lib/utils');
}

var _reactForAtom = require('react-for-atom');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let RevisionTimelineNode = class RevisionTimelineNode extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handlePhabricatorRevisionClick = this._handlePhabricatorRevisionClick.bind(this);
    this._handleSelectionChange = this._handleSelectionChange.bind(this);
  }

  _handlePhabricatorRevisionClick(event) {
    // Clicking an anchor opens the `href` in the browser. Stop propagation so it doesn't affect
    // the node selection in the Timeline.
    event.stopPropagation();

    const revision = (0, (_utils || _load_utils()).getPhabricatorRevisionFromCommitMessage)(this.props.revision.description);
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-phabricator-diff-open', { revision: revision });
  }

  _handleSelectionChange() {
    this.props.onSelectionChange(this.props.revision);
  }

  render() {
    var _props = this.props;
    const revisionStatus = _props.revisionStatus,
          index = _props.index,
          revision = _props.revision,
          revisionsCount = _props.revisionsCount,
          selectedIndex = _props.selectedIndex;
    const author = revision.author,
          bookmarks = revision.bookmarks,
          date = revision.date,
          description = revision.description,
          hash = revision.hash,
          title = revision.title;

    const revisionClassName = (0, (_classnames || _load_classnames()).default)('revision revision--actionable', {
      'selected-revision-inrange': index < selectedIndex,
      'selected-revision-end': index === selectedIndex,
      'selected-revision-last': index === revisionsCount - 1
    });
    const tooltip = `${ hash }: ${ title }
  Author: ${ author }
  Date: ${ date.toString() }`;

    const commitAuthor = (0, (_utils || _load_utils()).getCommitAuthorFromAuthorEmail)(author);
    let commitAuthorElement;
    if (commitAuthor != null) {
      commitAuthorElement = _reactForAtom.React.createElement(
        'span',
        { className: 'inline-block' },
        commitAuthor
      );
    }

    const phabricatorRevision = (0, (_utils || _load_utils()).getPhabricatorRevisionFromCommitMessage)(description);
    let phabricatorRevisionElement;
    if (phabricatorRevision != null) {
      phabricatorRevisionElement = _reactForAtom.React.createElement(
        'a',
        {
          className: 'inline-block',
          href: phabricatorRevision.url,
          onClick: this._handlePhabricatorRevisionClick },
        _reactForAtom.React.createElement(
          'strong',
          null,
          phabricatorRevision.name
        )
      );
    }

    let revisionStatusElement;
    if (revisionStatus != null) {
      revisionStatusElement = _reactForAtom.React.createElement(
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
        return _reactForAtom.React.createElement(
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
      bookmarksElement = _reactForAtom.React.createElement(
        'span',
        { className: 'inline-block text-success' },
        bookmarksToRender.join(' ')
      );
    }

    return _reactForAtom.React.createElement(
      'div',
      {
        className: revisionClassName,
        onClick: this._handleSelectionChange,
        title: tooltip },
      _reactForAtom.React.createElement('div', { className: 'revision-bubble' }),
      _reactForAtom.React.createElement(
        'div',
        { className: 'revision-label text-monospace' },
        _reactForAtom.React.createElement(
          'span',
          { className: 'inline-block' },
          hash.substr(0, 7)
        ),
        commitAuthorElement,
        phabricatorRevisionElement,
        revisionStatusElement,
        associatedExtraElement,
        bookmarksElement,
        _reactForAtom.React.createElement('br', null),
        _reactForAtom.React.createElement(
          'span',
          { className: 'revision-title' },
          title
        )
      )
    );
  }
};
exports.default = RevisionTimelineNode;
module.exports = exports['default'];