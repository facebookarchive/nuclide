'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _nuclideHgRpc;

function _load_nuclideHgRpc() {
  return _nuclideHgRpc = require('../../nuclide-hg-rpc');
}

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

class DiffTimelineView extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._subscriptions = new _atom.CompositeDisposable();
    this._updateRevisions = this._updateRevisions.bind(this);
    this._handleClickPublish = this._handleClickPublish.bind(this);
  }

  componentDidMount() {
    const { diffModel } = this.props;
    this._subscriptions.add(diffModel.onDidUpdateState(this._updateRevisions));
  }

  _updateRevisions() {
    this.forceUpdate();
  }

  render() {
    let content = null;
    const { diffModel, onSelectionChange } = this.props;
    const { activeRepositoryState } = diffModel.getState();
    if (activeRepositoryState.headRevision == null) {
      content = 'Revisions not loaded...';
    } else {
      const {
        compareRevisionId,
        headRevision,
        revisionStatuses,
        headToForkBaseRevisions
      } = activeRepositoryState;
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
    const { diffModel } = this.props;
    diffModel.setViewMode((_constants || _load_constants()).DiffMode.PUBLISH_MODE);
  }

  componentWillUnmount() {
    this._subscriptions.dispose();
  }
}

exports.default = DiffTimelineView; /**
                                     * Copyright (c) 2015-present, Facebook, Inc.
                                     * All rights reserved.
                                     *
                                     * This source code is licensed under the license found in the LICENSE file in
                                     * the root directory of this source tree.
                                     *
                                     * 
                                     */

function RevisionsTimelineComponent(props) {
  const { revisions, compareRevisionId, revisionStatuses } = props;
  const latestToOldestRevisions = revisions.slice().reverse();
  const selectedIndex = latestToOldestRevisions.findIndex(revision => revision.id === compareRevisionId);

  const headRevision = (0, (_utils || _load_utils()).getHeadRevision)(revisions);
  const { CommitPhase } = (_nuclideHgRpc || _load_nuclideHgRpc()).hgConstants;
  const canPublish = headRevision != null && headRevision.phase === CommitPhase.DRAFT;
  const publishTooltip = {
    delay: 100,
    placement: 'top',
    title: 'Publish your last commit to a Phabricator differential revision.'
  };

  return _reactForAtom.React.createElement(
    'div',
    { className: 'revision-timeline-wrap' },
    _reactForAtom.React.createElement(
      (_Button || _load_Button()).Button,
      {
        className: 'pull-right',
        disabled: !canPublish,
        size: (_Button || _load_Button()).ButtonSizes.SMALL,
        tooltip: publishTooltip,
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
          selectedIndex: selectedIndex,
          diffModel: props.diffModel,
          dirtyFileCount: props.dirtyFileCount,
          revisionsCount: revisions.length,
          onSelectionChange: () => {
            props.onSelectionChange(latestToOldestRevisions[0]);
          }
        }),
        latestToOldestRevisions.slice(0, -1).map((revision, i) => _reactForAtom.React.createElement((_RevisionTimelineNode || _load_RevisionTimelineNode()).default, {
          index: i,
          key: revision.hash,
          selectedIndex: selectedIndex,
          revision: revision,
          revisionStatus: revisionStatuses.get(revision.id),
          revisionsCount: revisions.length,
          onSelectionChange: () => {
            props.onSelectionChange(latestToOldestRevisions[i + 1]);
          }
        }))
      )
    )
  );
}