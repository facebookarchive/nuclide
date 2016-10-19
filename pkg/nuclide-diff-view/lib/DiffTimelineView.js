Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

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

var _nuclideUiButton;

function _load_nuclideUiButton() {
  return _nuclideUiButton = require('../../nuclide-ui/Button');
}

var DiffTimelineView = (function (_React$Component) {
  _inherits(DiffTimelineView, _React$Component);

  function DiffTimelineView(props) {
    _classCallCheck(this, DiffTimelineView);

    _get(Object.getPrototypeOf(DiffTimelineView.prototype), 'constructor', this).call(this, props);
    this._subscriptions = new (_atom || _load_atom()).CompositeDisposable();
    this._updateRevisions = this._updateRevisions.bind(this);
    this._handleClickPublish = this._handleClickPublish.bind(this);
  }

  _createClass(DiffTimelineView, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var diffModel = this.props.diffModel;

      this._subscriptions.add(diffModel.onDidUpdateState(this._updateRevisions));
    }
  }, {
    key: '_updateRevisions',
    value: function _updateRevisions() {
      this.forceUpdate();
    }
  }, {
    key: 'render',
    value: function render() {
      var content = null;
      var _props = this.props;
      var diffModel = _props.diffModel;
      var onSelectionChange = _props.onSelectionChange;

      var _diffModel$getState = diffModel.getState();

      var revisionsState = _diffModel$getState.revisionsState;

      if (revisionsState == null) {
        content = 'Revisions not loaded...';
      } else {
        var compareCommitId = revisionsState.compareCommitId;
        var _revisionStatuses = revisionsState.revisionStatuses;
        var headCommitId = revisionsState.headCommitId;
        var headToForkBaseRevisions = revisionsState.headToForkBaseRevisions;

        content = (_reactForAtom || _load_reactForAtom()).React.createElement(RevisionsTimelineComponent, {
          diffModel: diffModel,
          compareRevisionId: compareCommitId || headCommitId,
          dirtyFileCount: diffModel.getActiveStackDirtyFileChanges().size,
          onSelectionChange: onSelectionChange,
          onClickPublish: this._handleClickPublish,
          revisions: headToForkBaseRevisions,
          revisionStatuses: _revisionStatuses
        });
      }

      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-diff-timeline padded' },
        content
      );
    }
  }, {
    key: '_handleClickPublish',
    value: function _handleClickPublish() {
      var diffModel = this.props.diffModel;

      diffModel.setViewMode((_constants || _load_constants()).DiffMode.PUBLISH_MODE);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._subscriptions.dispose();
    }
  }]);

  return DiffTimelineView;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.default = DiffTimelineView;

function RevisionsTimelineComponent(props) {
  var revisions = props.revisions;
  var compareRevisionId = props.compareRevisionId;
  var revisionStatuses = props.revisionStatuses;

  var latestToOldestRevisions = revisions.slice().reverse();
  var selectedIndex = latestToOldestRevisions.findIndex(function (revision) {
    return revision.id === compareRevisionId;
  });

  return (_reactForAtom || _load_reactForAtom()).React.createElement(
    'div',
    { className: 'revision-timeline-wrap' },
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_nuclideUiButton || _load_nuclideUiButton()).Button,
      {
        className: 'pull-right',
        size: (_nuclideUiButton || _load_nuclideUiButton()).ButtonSizes.SMALL,
        onClick: props.onClickPublish },
      'Publish to Phabricator'
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      'h5',
      { style: { marginTop: 0 } },
      'Compare Revisions'
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      'div',
      { className: 'revision-selector' },
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'revisions' },
        (_reactForAtom || _load_reactForAtom()).React.createElement((_UncommittedChangesTimelineNode || _load_UncommittedChangesTimelineNode()).default, {
          diffModel: props.diffModel,
          dirtyFileCount: props.dirtyFileCount
        }),
        latestToOldestRevisions.map(function (revision, i) {
          return (_reactForAtom || _load_reactForAtom()).React.createElement((_RevisionTimelineNode || _load_RevisionTimelineNode()).default, {
            index: i,
            key: revision.hash,
            selectedIndex: selectedIndex,
            revision: revision,
            revisionStatus: revisionStatuses.get(revision.id),
            revisionsCount: revisions.length,
            onSelectionChange: props.onSelectionChange
          });
        })
      )
    )
  );
}
module.exports = exports.default;