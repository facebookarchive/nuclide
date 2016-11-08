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

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _RevisionTimelineNode;

function _load_RevisionTimelineNode() {
  return _RevisionTimelineNode = _interopRequireDefault(require('./RevisionTimelineNode'));
}

var _UncommittedChangesTimelineNode;

function _load_UncommittedChangesTimelineNode() {
  return _UncommittedChangesTimelineNode = _interopRequireDefault(require('./UncommittedChangesTimelineNode'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let DiffTimelineView = class DiffTimelineView extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._subscriptions = new _atom.CompositeDisposable();
    this._updateRevisions = this._updateRevisions.bind(this);
    this._handleClickPublish = this._handleClickPublish.bind(this);
  }

  componentDidMount() {
    const diffModel = this.props.diffModel;

    this._subscriptions.add(diffModel.onDidUpdateState(this._updateRevisions));
  }

  _updateRevisions() {
    this.forceUpdate();
  }

  render() {
    let content = null;
    var _props = this.props;
    const diffModel = _props.diffModel,
          onSelectionChange = _props.onSelectionChange;

    var _diffModel$getState = diffModel.getState();

    const activeRepositoryState = _diffModel$getState.activeRepositoryState;

    if (activeRepositoryState.headRevision == null) {
      content = 'Revisions not loaded...';
    } else {
      const compareRevisionId = activeRepositoryState.compareRevisionId,
            headRevision = activeRepositoryState.headRevision,
            revisionStatuses = activeRepositoryState.revisionStatuses,
            headToForkBaseRevisions = activeRepositoryState.headToForkBaseRevisions;

      content = _reactForAtom.React.createElement(RevisionsTimelineComponent, {
        diffModel: diffModel,
        compareRevisionId: compareRevisionId || headRevision.id,
        dirtyFileCount: diffModel.getDirtyFileChangesCount(),
        onSelectionChange: onSelectionChange,
        onClickPublish: this._handleClickPublish,
        revisions: headToForkBaseRevisions,
        revisionStatuses: revisionStatuses
      });
    }

    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-diff-timeline padded' },
      content
    );
  }

  _handleClickPublish() {
    const diffModel = this.props.diffModel;

    diffModel.setViewMode((_constants || _load_constants()).DiffMode.PUBLISH_MODE);
  }

  componentWillUnmount() {
    this._subscriptions.dispose();
  }
};
exports.default = DiffTimelineView;


function RevisionsTimelineComponent(props) {
  const revisions = props.revisions,
        compareRevisionId = props.compareRevisionId,
        revisionStatuses = props.revisionStatuses;

  const latestToOldestRevisions = revisions.slice().reverse();
  const selectedIndex = latestToOldestRevisions.findIndex(revision => revision.id === compareRevisionId);

  return _reactForAtom.React.createElement(
    'div',
    { className: 'revision-timeline-wrap' },
    _reactForAtom.React.createElement(
      (_Button || _load_Button()).Button,
      {
        className: 'pull-right',
        size: (_Button || _load_Button()).ButtonSizes.SMALL,
        onClick: props.onClickPublish },
      'Publish to Phabricator'
    ),
    _reactForAtom.React.createElement(
      'h5',
      { style: { marginTop: 0 } },
      'Compare Revisions'
    ),
    _reactForAtom.React.createElement(
      'div',
      { className: 'revision-selector' },
      _reactForAtom.React.createElement(
        'div',
        { className: 'revisions' },
        _reactForAtom.React.createElement((_UncommittedChangesTimelineNode || _load_UncommittedChangesTimelineNode()).default, {
          diffModel: props.diffModel,
          dirtyFileCount: props.dirtyFileCount
        }),
        latestToOldestRevisions.map((revision, i) => _reactForAtom.React.createElement((_RevisionTimelineNode || _load_RevisionTimelineNode()).default, {
          index: i,
          key: revision.hash,
          selectedIndex: selectedIndex,
          revision: revision,
          revisionStatus: revisionStatuses.get(revision.id),
          revisionsCount: revisions.length,
          onSelectionChange: props.onSelectionChange
        }))
      )
    )
  );
}
module.exports = exports['default'];