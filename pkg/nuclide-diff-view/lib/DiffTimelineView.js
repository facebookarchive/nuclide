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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var DiffTimelineView = (function (_React$Component) {
  _inherits(DiffTimelineView, _React$Component);

  function DiffTimelineView(props) {
    _classCallCheck(this, DiffTimelineView);

    _get(Object.getPrototypeOf(DiffTimelineView.prototype), 'constructor', this).call(this, props);
    this._subscriptions = new _atom.CompositeDisposable();
    var diffModel = props.diffModel;

    this.state = {
      revisionsState: null
    };
    var boundUpdateRevisions = this._updateRevisions.bind(this);
    this._subscriptions.add(diffModel.onRevisionsUpdate(boundUpdateRevisions));
    diffModel.getActiveRevisionsState().then(boundUpdateRevisions);
  }

  _createClass(DiffTimelineView, [{
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
      var revisionsState = this.state.revisionsState;

      if (revisionsState == null) {
        content = 'Revisions not loaded...';
      } else {
        var _revisions = revisionsState.revisions;
        var compareCommitId = revisionsState.compareCommitId;
        var commitId = revisionsState.commitId;

        content = _reactForAtom.React.createElement(RevisionsTimelineComponent, {
          revisions: _revisions,
          compareRevisionId: compareCommitId || commitId,
          onSelectionChange: this.props.onSelectionChange
        });
      }
      return _reactForAtom.React.createElement(
        'div',
        { className: 'diff-timeline padded' },
        content
      );
    }
  }, {
    key: 'handleSelectionChange',
    value: function handleSelectionChange(revision) {
      this.props.onSelectionChange(revision);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._subscriptions.dispose();
    }
  }]);

  return DiffTimelineView;
})(_reactForAtom.React.Component);

exports['default'] = DiffTimelineView;

var RevisionsTimelineComponent = (function (_React$Component2) {
  _inherits(RevisionsTimelineComponent, _React$Component2);

  function RevisionsTimelineComponent() {
    _classCallCheck(this, RevisionsTimelineComponent);

    _get(Object.getPrototypeOf(RevisionsTimelineComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(RevisionsTimelineComponent, [{
    key: 'render',
    value: function render() {
      var _this = this;

      var _props = this.props;
      var revisions = _props.revisions;
      var compareRevisionId = _props.compareRevisionId;

      var latestToOldestRevisions = revisions.slice().reverse();
      var selectedIndex = latestToOldestRevisions.findIndex(function (revision) {
        return revision.id === compareRevisionId;
      });

      return _reactForAtom.React.createElement(
        'div',
        { className: 'revision-timeline-wrap' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'revision-selector' },
          _reactForAtom.React.createElement(
            'div',
            { className: 'revisions' },
            latestToOldestRevisions.map(function (revision, i) {
              return _reactForAtom.React.createElement(RevisionTimelineNode, {
                index: i,
                key: revision.hash,
                selectedIndex: selectedIndex,
                revision: revision,
                revisionsCount: revisions.length,
                onSelectionChange: _this.props.onSelectionChange
              });
            })
          )
        )
      );
    }
  }]);

  return RevisionsTimelineComponent;
})(_reactForAtom.React.Component);

var RevisionTimelineNode = (function (_React$Component3) {
  _inherits(RevisionTimelineNode, _React$Component3);

  function RevisionTimelineNode() {
    _classCallCheck(this, RevisionTimelineNode);

    _get(Object.getPrototypeOf(RevisionTimelineNode.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(RevisionTimelineNode, [{
    key: 'render',
    value: function render() {
      var _props2 = this.props;
      var revision = _props2.revision;
      var index = _props2.index;
      var selectedIndex = _props2.selectedIndex;
      var revisionsCount = _props2.revisionsCount;
      var bookmarks = revision.bookmarks;
      var title = revision.title;
      var author = revision.author;
      var hash = revision.hash;
      var date = revision.date;

      var revisionClassName = (0, _classnames2['default'])({
        revision: true,
        'selected-revision-inrange': index < selectedIndex,
        'selected-revision-start': index === 0,
        'selected-revision-end': index === selectedIndex,
        'selected-revision-last': index === revisionsCount - 1
      });
      var tooltip = hash + ': ' + title + '\n  Author: ' + author + '\n  Date: ' + date;
      var bookmarksToRender = bookmarks.slice();
      // Add `BASE`
      if (index === 0 && revisionsCount > 1 && bookmarks.length === 0) {
        bookmarksToRender.push('HEAD');
      }
      if (index === revisionsCount - 1 && bookmarks.length === 0) {
        bookmarksToRender.push('BASE');
      }
      return _reactForAtom.React.createElement(
        'div',
        {
          className: revisionClassName,
          onClick: this.handleSelectionChange.bind(this, revision),
          title: tooltip },
        _reactForAtom.React.createElement('div', { className: 'revision-bubble' }),
        _reactForAtom.React.createElement(
          'div',
          { className: 'revision-label' },
          title,
          ' (',
          bookmarksToRender.length ? bookmarksToRender.join(',') : hash,
          ')'
        )
      );
    }
  }, {
    key: 'handleSelectionChange',
    value: function handleSelectionChange() {
      this.props.onSelectionChange(this.props.revision);
    }
  }]);

  return RevisionTimelineNode;
})(_reactForAtom.React.Component);

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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QyxDQUFDO0FBQ0gsVUFBTSxPQUFPLEdBQU0sSUFBSSxVQUFLLEtBQUssb0JBQ3pCLE1BQU0sa0JBQ1IsSUFBSSxBQUFFLENBQUM7QUFDYixVQUFNLGlCQUFpQixHQUFHLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFNUMsVUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLGNBQWMsR0FBRyxDQUFDLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDL0QseUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQ2hDO0FBQ0QsVUFBSSxLQUFLLEtBQUssY0FBYyxHQUFHLENBQUMsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUMxRCx5QkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDaEM7QUFDRCxhQUNFOzs7QUFDRSxtQkFBUyxFQUFFLGlCQUFpQixBQUFDO0FBQzdCLGlCQUFPLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEFBQUM7QUFDekQsZUFBSyxFQUFFLE9BQU8sQUFBQztRQUNmLDJDQUFLLFNBQVMsRUFBQyxpQkFBaUIsR0FBRztRQUNuQzs7WUFBSyxTQUFTLEVBQUMsZ0JBQWdCO1VBQzVCLEtBQUs7O1VBQUksaUJBQWlCLENBQUMsTUFBTSxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJOztTQUNuRTtPQUNGLENBQ047S0FDSDs7O1dBRW9CLGlDQUFTO0FBQzVCLFVBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNuRDs7O1NBdkNHLG9CQUFvQjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiRGlmZlRpbWVsaW5lVmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIERpZmZWaWV3TW9kZWwgZnJvbSAnLi9EaWZmVmlld01vZGVsJztcbmltcG9ydCB0eXBlIHtSZXZpc2lvbnNTdGF0ZX0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSB7UmV2aXNpb25JbmZvfSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZS9saWIvSGdTZXJ2aWNlJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbnR5cGUgRGlmZlRpbWVsaW5lVmlld1Byb3BzID0ge1xuICBkaWZmTW9kZWw6IERpZmZWaWV3TW9kZWw7XG4gIG9uU2VsZWN0aW9uQ2hhbmdlOiAocmV2aXNpb25JbmZvOiBSZXZpc2lvbkluZm8pID0+IGFueTtcbn07XG5cbnR5cGUgRGlmZlRpbWVsaW5lVmlld1N0YXRlID0ge1xuICByZXZpc2lvbnNTdGF0ZTogP1JldmlzaW9uc1N0YXRlO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlmZlRpbWVsaW5lVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBEaWZmVGltZWxpbmVWaWV3UHJvcHM7XG4gIHN0YXRlOiBEaWZmVGltZWxpbmVWaWV3U3RhdGU7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBEaWZmVGltZWxpbmVWaWV3UHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgY29uc3Qge2RpZmZNb2RlbH0gPSBwcm9wcztcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgcmV2aXNpb25zU3RhdGU6IG51bGwsXG4gICAgfTtcbiAgICBjb25zdCBib3VuZFVwZGF0ZVJldmlzaW9ucyA9IHRoaXMuX3VwZGF0ZVJldmlzaW9ucy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgZGlmZk1vZGVsLm9uUmV2aXNpb25zVXBkYXRlKGJvdW5kVXBkYXRlUmV2aXNpb25zKVxuICAgICk7XG4gICAgZGlmZk1vZGVsLmdldEFjdGl2ZVJldmlzaW9uc1N0YXRlKCkudGhlbihib3VuZFVwZGF0ZVJldmlzaW9ucyk7XG4gIH1cblxuICBfdXBkYXRlUmV2aXNpb25zKG5ld1JldmlzaW9uc1N0YXRlOiA/UmV2aXNpb25zU3RhdGUpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHJldmlzaW9uc1N0YXRlOiBuZXdSZXZpc2lvbnNTdGF0ZSxcbiAgICB9KTtcbiAgfVxuXG4gIHJlbmRlcigpOiA/UmVhY3QuRWxlbWVudCB7XG4gICAgbGV0IGNvbnRlbnQgPSBudWxsO1xuICAgIGNvbnN0IHtyZXZpc2lvbnNTdGF0ZX0gPSB0aGlzLnN0YXRlO1xuICAgIGlmIChyZXZpc2lvbnNTdGF0ZSA9PSBudWxsKSB7XG4gICAgICBjb250ZW50ID0gJ1JldmlzaW9ucyBub3QgbG9hZGVkLi4uJztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qge3JldmlzaW9ucywgY29tcGFyZUNvbW1pdElkLCBjb21taXRJZH0gPSByZXZpc2lvbnNTdGF0ZTtcbiAgICAgIGNvbnRlbnQgPSAoXG4gICAgICAgIDxSZXZpc2lvbnNUaW1lbGluZUNvbXBvbmVudFxuICAgICAgICAgIHJldmlzaW9ucz17cmV2aXNpb25zfVxuICAgICAgICAgIGNvbXBhcmVSZXZpc2lvbklkPXtjb21wYXJlQ29tbWl0SWQgfHwgY29tbWl0SWR9XG4gICAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2U9e3RoaXMucHJvcHMub25TZWxlY3Rpb25DaGFuZ2V9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkaWZmLXRpbWVsaW5lIHBhZGRlZFwiPlxuICAgICAgICB7Y29udGVudH1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UocmV2aXNpb246IFJldmlzaW9uSW5mbyk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMub25TZWxlY3Rpb25DaGFuZ2UocmV2aXNpb24pO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cbn1cblxudHlwZSBSZXZpc2lvbnNDb21wb25lbnRQcm9wcyA9IHtcbiAgcmV2aXNpb25zOiBBcnJheTxSZXZpc2lvbkluZm8+O1xuICBjb21wYXJlUmV2aXNpb25JZDogbnVtYmVyO1xuICBvblNlbGVjdGlvbkNoYW5nZTogKHJldmlzaW9uSW5mbzogUmV2aXNpb25JbmZvKSA9PiBhbnk7XG59O1xuXG5jbGFzcyBSZXZpc2lvbnNUaW1lbGluZUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBSZXZpc2lvbnNDb21wb25lbnRQcm9wcztcblxuICByZW5kZXIoKTogUmVhY3QuRWxlbWVudCB7XG4gICAgY29uc3Qge3JldmlzaW9ucywgY29tcGFyZVJldmlzaW9uSWR9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBsYXRlc3RUb09sZGVzdFJldmlzaW9ucyA9IHJldmlzaW9ucy5zbGljZSgpLnJldmVyc2UoKTtcbiAgICBjb25zdCBzZWxlY3RlZEluZGV4ID0gbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnMuZmluZEluZGV4KFxuICAgICAgcmV2aXNpb24gPT4gcmV2aXNpb24uaWQgPT09IGNvbXBhcmVSZXZpc2lvbklkXG4gICAgKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInJldmlzaW9uLXRpbWVsaW5lLXdyYXBcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZXZpc2lvbi1zZWxlY3RvclwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmV2aXNpb25zXCI+XG4gICAgICAgICAgICB7bGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnMubWFwKChyZXZpc2lvbiwgaSkgPT5cbiAgICAgICAgICAgICAgPFJldmlzaW9uVGltZWxpbmVOb2RlXG4gICAgICAgICAgICAgICAgaW5kZXg9e2l9XG4gICAgICAgICAgICAgICAga2V5PXtyZXZpc2lvbi5oYXNofVxuICAgICAgICAgICAgICAgIHNlbGVjdGVkSW5kZXg9e3NlbGVjdGVkSW5kZXh9XG4gICAgICAgICAgICAgICAgcmV2aXNpb249e3JldmlzaW9ufVxuICAgICAgICAgICAgICAgIHJldmlzaW9uc0NvdW50PXtyZXZpc2lvbnMubGVuZ3RofVxuICAgICAgICAgICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlPXt0aGlzLnByb3BzLm9uU2VsZWN0aW9uQ2hhbmdlfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG5cbnR5cGUgUmV2aXNpb25UaW1lbGluZU5vZGVQcm9wcyA9IHtcbiAgcmV2aXNpb246IFJldmlzaW9uSW5mbztcbiAgaW5kZXg6IG51bWJlcjtcbiAgc2VsZWN0ZWRJbmRleDogbnVtYmVyO1xuICByZXZpc2lvbnNDb3VudDogbnVtYmVyO1xuICBvblNlbGVjdGlvbkNoYW5nZTogKHJldmlzaW9uSW5mbzogUmV2aXNpb25JbmZvKSA9PiBhbnk7XG59O1xuXG5jbGFzcyBSZXZpc2lvblRpbWVsaW5lTm9kZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBSZXZpc2lvblRpbWVsaW5lTm9kZVByb3BzO1xuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICBjb25zdCB7cmV2aXNpb24sIGluZGV4LCBzZWxlY3RlZEluZGV4LCByZXZpc2lvbnNDb3VudH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtib29rbWFya3MsIHRpdGxlLCBhdXRob3IsIGhhc2gsIGRhdGV9ID0gcmV2aXNpb247XG4gICAgY29uc3QgcmV2aXNpb25DbGFzc05hbWUgPSBjbGFzc25hbWVzKHtcbiAgICAgIHJldmlzaW9uOiB0cnVlLFxuICAgICAgJ3NlbGVjdGVkLXJldmlzaW9uLWlucmFuZ2UnOiBpbmRleCA8IHNlbGVjdGVkSW5kZXgsXG4gICAgICAnc2VsZWN0ZWQtcmV2aXNpb24tc3RhcnQnOiBpbmRleCA9PT0gMCxcbiAgICAgICdzZWxlY3RlZC1yZXZpc2lvbi1lbmQnOiBpbmRleCA9PT0gc2VsZWN0ZWRJbmRleCxcbiAgICAgICdzZWxlY3RlZC1yZXZpc2lvbi1sYXN0JzogaW5kZXggPT09IHJldmlzaW9uc0NvdW50IC0gMSxcbiAgICB9KTtcbiAgICBjb25zdCB0b29sdGlwID0gYCR7aGFzaH06ICR7dGl0bGV9XG4gIEF1dGhvcjogJHthdXRob3J9XG4gIERhdGU6ICR7ZGF0ZX1gO1xuICAgIGNvbnN0IGJvb2ttYXJrc1RvUmVuZGVyID0gYm9va21hcmtzLnNsaWNlKCk7XG4gICAgLy8gQWRkIGBCQVNFYFxuICAgIGlmIChpbmRleCA9PT0gMCAmJiByZXZpc2lvbnNDb3VudCA+IDEgJiYgYm9va21hcmtzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgYm9va21hcmtzVG9SZW5kZXIucHVzaCgnSEVBRCcpO1xuICAgIH1cbiAgICBpZiAoaW5kZXggPT09IHJldmlzaW9uc0NvdW50IC0gMSAmJiBib29rbWFya3MubGVuZ3RoID09PSAwKSB7XG4gICAgICBib29rbWFya3NUb1JlbmRlci5wdXNoKCdCQVNFJyk7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT17cmV2aXNpb25DbGFzc05hbWV9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlU2VsZWN0aW9uQ2hhbmdlLmJpbmQodGhpcywgcmV2aXNpb24pfVxuICAgICAgICB0aXRsZT17dG9vbHRpcH0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmV2aXNpb24tYnViYmxlXCIgLz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZXZpc2lvbi1sYWJlbFwiPlxuICAgICAgICAgIHt0aXRsZX0gKHtib29rbWFya3NUb1JlbmRlci5sZW5ndGggPyBib29rbWFya3NUb1JlbmRlci5qb2luKCcsJykgOiBoYXNofSlcbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgaGFuZGxlU2VsZWN0aW9uQ2hhbmdlKCk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMub25TZWxlY3Rpb25DaGFuZ2UodGhpcy5wcm9wcy5yZXZpc2lvbik7XG4gIH1cbn1cbiJdfQ==