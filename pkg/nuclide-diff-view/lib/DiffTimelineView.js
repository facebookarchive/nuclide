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

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _RevisionTimelineNode2;

function _RevisionTimelineNode() {
  return _RevisionTimelineNode2 = _interopRequireDefault(require('./RevisionTimelineNode'));
}

var _UncommittedChangesTimelineNode2;

function _UncommittedChangesTimelineNode() {
  return _UncommittedChangesTimelineNode2 = _interopRequireDefault(require('./UncommittedChangesTimelineNode'));
}

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../nuclide-ui/lib/Button');
}

var DiffTimelineView = (function (_React$Component) {
  _inherits(DiffTimelineView, _React$Component);

  function DiffTimelineView(props) {
    _classCallCheck(this, DiffTimelineView);

    _get(Object.getPrototypeOf(DiffTimelineView.prototype), 'constructor', this).call(this, props);
    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
    this._updateRevisions = this._updateRevisions.bind(this);
    this._handleClickPublish = this._handleClickPublish.bind(this);
    this.state = {
      revisionsState: null
    };
  }

  _createClass(DiffTimelineView, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var diffModel = this.props.diffModel;

      this._subscriptions.add(diffModel.onRevisionsUpdate(this._updateRevisions));
      diffModel.getActiveRevisionsState().then(this._updateRevisions);
    }
  }, {
    key: '_updateRevisions',
    value: function _updateRevisions(newRevisionsState) {
      this.setState({
        revisionsState: newRevisionsState
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var content = null;
      var _props = this.props;
      var diffModel = _props.diffModel;
      var onSelectionChange = _props.onSelectionChange;
      var revisionsState = this.state.revisionsState;

      if (revisionsState == null) {
        content = 'Revisions not loaded...';
      } else {
        var _revisions = revisionsState.revisions;
        var compareCommitId = revisionsState.compareCommitId;
        var commitId = revisionsState.commitId;
        var _diffStatuses = revisionsState.diffStatuses;

        content = (_reactForAtom2 || _reactForAtom()).React.createElement(RevisionsTimelineComponent, {
          diffModel: diffModel,
          compareRevisionId: compareCommitId || commitId,
          dirtyFileCount: diffModel.getActiveStackDirtyFileChanges().size,
          onSelectionChange: onSelectionChange,
          onClickPublish: this._handleClickPublish,
          revisions: _revisions,
          diffStatuses: _diffStatuses
        });
      }

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-diff-timeline padded' },
        content
      );
    }
  }, {
    key: '_handleClickPublish',
    value: function _handleClickPublish() {
      var diffModel = this.props.diffModel;

      diffModel.setViewMode((_constants2 || _constants()).DiffMode.PUBLISH_MODE);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._subscriptions.dispose();
    }
  }]);

  return DiffTimelineView;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = DiffTimelineView;

function RevisionsTimelineComponent(props) {
  var revisions = props.revisions;
  var compareRevisionId = props.compareRevisionId;
  var diffStatuses = props.diffStatuses;

  var latestToOldestRevisions = revisions.slice().reverse();
  var selectedIndex = latestToOldestRevisions.findIndex(function (revision) {
    return revision.id === compareRevisionId;
  });

  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    { className: 'revision-timeline-wrap' },
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_nuclideUiLibButton2 || _nuclideUiLibButton()).Button,
      {
        className: 'pull-right',
        size: (_nuclideUiLibButton2 || _nuclideUiLibButton()).ButtonSizes.SMALL,
        onClick: props.onClickPublish },
      'Publish to Phabricator'
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      'h5',
      { style: { marginTop: 0 } },
      'Compare Revisions'
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      'div',
      { className: 'revision-selector' },
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'revisions' },
        (_reactForAtom2 || _reactForAtom()).React.createElement((_UncommittedChangesTimelineNode2 || _UncommittedChangesTimelineNode()).default, {
          diffModel: props.diffModel,
          dirtyFileCount: props.dirtyFileCount
        }),
        latestToOldestRevisions.map(function (revision, i) {
          return (_reactForAtom2 || _reactForAtom()).React.createElement((_RevisionTimelineNode2 || _RevisionTimelineNode()).default, {
            index: i,
            key: revision.hash,
            selectedIndex: selectedIndex,
            revision: revision,
            diffStatus: diffStatuses.get(revision.id),
            revisionsCount: revisions.length,
            onSelectionChange: props.onSelectionChange
          });
        })
      )
    )
  );
}
module.exports = exports.default;