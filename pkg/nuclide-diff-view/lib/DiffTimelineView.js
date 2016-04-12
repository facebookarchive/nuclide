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
//# sourceMappingURL=data:application/json;base64,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QyxDQUFDO0FBQ0gsVUFBTSxPQUFPLEdBQU0sSUFBSSxVQUFLLEtBQUssb0JBQ3pCLE1BQU0sa0JBQ1IsSUFBSSxBQUFFLENBQUM7QUFDYixVQUFNLGlCQUFpQixHQUFHLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFNUMsVUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLGNBQWMsR0FBRyxDQUFDLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDL0QseUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQ2hDO0FBQ0QsVUFBSSxLQUFLLEtBQUssY0FBYyxHQUFHLENBQUMsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUMxRCx5QkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDaEM7QUFDRCxhQUNFOzs7QUFDRSxtQkFBUyxFQUFFLGlCQUFpQixBQUFDO0FBQzdCLGlCQUFPLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEFBQUM7QUFDekQsZUFBSyxFQUFFLE9BQU8sQUFBQztRQUNmLDJDQUFLLFNBQVMsRUFBQyxpQkFBaUIsR0FBRztRQUNuQzs7WUFBSyxTQUFTLEVBQUMsZ0JBQWdCO1VBQzVCLEtBQUs7O1VBQUksaUJBQWlCLENBQUMsTUFBTSxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJOztTQUNuRTtPQUNGLENBQ047S0FDSDs7O1dBRW9CLGlDQUFTO0FBQzVCLFVBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNuRDs7O1NBdkNHLG9CQUFvQjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiRGlmZlRpbWVsaW5lVmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIERpZmZWaWV3TW9kZWwgZnJvbSAnLi9EaWZmVmlld01vZGVsJztcbmltcG9ydCB0eXBlIHtSZXZpc2lvbnNTdGF0ZX0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSB7UmV2aXNpb25JbmZvfSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZS9saWIvSGdTZXJ2aWNlJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbnR5cGUgRGlmZlRpbWVsaW5lVmlld1Byb3BzID0ge1xuICBkaWZmTW9kZWw6IERpZmZWaWV3TW9kZWw7XG4gIG9uU2VsZWN0aW9uQ2hhbmdlOiAocmV2aXNpb25JbmZvOiBSZXZpc2lvbkluZm8pID0+IGFueTtcbn07XG5cbnR5cGUgRGlmZlRpbWVsaW5lVmlld1N0YXRlID0ge1xuICByZXZpc2lvbnNTdGF0ZTogP1JldmlzaW9uc1N0YXRlO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlmZlRpbWVsaW5lVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBEaWZmVGltZWxpbmVWaWV3UHJvcHM7XG4gIHN0YXRlOiBEaWZmVGltZWxpbmVWaWV3U3RhdGU7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBEaWZmVGltZWxpbmVWaWV3UHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgY29uc3Qge2RpZmZNb2RlbH0gPSBwcm9wcztcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgcmV2aXNpb25zU3RhdGU6IG51bGwsXG4gICAgfTtcbiAgICBjb25zdCBib3VuZFVwZGF0ZVJldmlzaW9ucyA9IHRoaXMuX3VwZGF0ZVJldmlzaW9ucy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgZGlmZk1vZGVsLm9uUmV2aXNpb25zVXBkYXRlKGJvdW5kVXBkYXRlUmV2aXNpb25zKVxuICAgICk7XG4gICAgZGlmZk1vZGVsLmdldEFjdGl2ZVJldmlzaW9uc1N0YXRlKCkudGhlbihib3VuZFVwZGF0ZVJldmlzaW9ucyk7XG4gIH1cblxuICBfdXBkYXRlUmV2aXNpb25zKG5ld1JldmlzaW9uc1N0YXRlOiA/UmV2aXNpb25zU3RhdGUpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHJldmlzaW9uc1N0YXRlOiBuZXdSZXZpc2lvbnNTdGF0ZSxcbiAgICB9KTtcbiAgfVxuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICBsZXQgY29udGVudCA9IG51bGw7XG4gICAgY29uc3Qge3JldmlzaW9uc1N0YXRlfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKHJldmlzaW9uc1N0YXRlID09IG51bGwpIHtcbiAgICAgIGNvbnRlbnQgPSAnUmV2aXNpb25zIG5vdCBsb2FkZWQuLi4nO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB7cmV2aXNpb25zLCBjb21wYXJlQ29tbWl0SWQsIGNvbW1pdElkfSA9IHJldmlzaW9uc1N0YXRlO1xuICAgICAgY29udGVudCA9IChcbiAgICAgICAgPFJldmlzaW9uc1RpbWVsaW5lQ29tcG9uZW50XG4gICAgICAgICAgcmV2aXNpb25zPXtyZXZpc2lvbnN9XG4gICAgICAgICAgY29tcGFyZVJldmlzaW9uSWQ9e2NvbXBhcmVDb21taXRJZCB8fCBjb21taXRJZH1cbiAgICAgICAgICBvblNlbGVjdGlvbkNoYW5nZT17dGhpcy5wcm9wcy5vblNlbGVjdGlvbkNoYW5nZX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRpZmYtdGltZWxpbmUgcGFkZGVkXCI+XG4gICAgICAgIHtjb250ZW50fVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIGhhbmRsZVNlbGVjdGlvbkNoYW5nZShyZXZpc2lvbjogUmV2aXNpb25JbmZvKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5vblNlbGVjdGlvbkNoYW5nZShyZXZpc2lvbik7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG50eXBlIFJldmlzaW9uc0NvbXBvbmVudFByb3BzID0ge1xuICByZXZpc2lvbnM6IEFycmF5PFJldmlzaW9uSW5mbz47XG4gIGNvbXBhcmVSZXZpc2lvbklkOiBudW1iZXI7XG4gIG9uU2VsZWN0aW9uQ2hhbmdlOiAocmV2aXNpb25JbmZvOiBSZXZpc2lvbkluZm8pID0+IGFueTtcbn07XG5cbmNsYXNzIFJldmlzaW9uc1RpbWVsaW5lQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFJldmlzaW9uc0NvbXBvbmVudFByb3BzO1xuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHtyZXZpc2lvbnMsIGNvbXBhcmVSZXZpc2lvbklkfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnMgPSByZXZpc2lvbnMuc2xpY2UoKS5yZXZlcnNlKCk7XG4gICAgY29uc3Qgc2VsZWN0ZWRJbmRleCA9IGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zLmZpbmRJbmRleChcbiAgICAgIHJldmlzaW9uID0+IHJldmlzaW9uLmlkID09PSBjb21wYXJlUmV2aXNpb25JZFxuICAgICk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZXZpc2lvbi10aW1lbGluZS13cmFwXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmV2aXNpb24tc2VsZWN0b3JcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJldmlzaW9uc1wiPlxuICAgICAgICAgICAge2xhdGVzdFRvT2xkZXN0UmV2aXNpb25zLm1hcCgocmV2aXNpb24sIGkpID0+XG4gICAgICAgICAgICAgIDxSZXZpc2lvblRpbWVsaW5lTm9kZVxuICAgICAgICAgICAgICAgIGluZGV4PXtpfVxuICAgICAgICAgICAgICAgIGtleT17cmV2aXNpb24uaGFzaH1cbiAgICAgICAgICAgICAgICBzZWxlY3RlZEluZGV4PXtzZWxlY3RlZEluZGV4fVxuICAgICAgICAgICAgICAgIHJldmlzaW9uPXtyZXZpc2lvbn1cbiAgICAgICAgICAgICAgICByZXZpc2lvbnNDb3VudD17cmV2aXNpb25zLmxlbmd0aH1cbiAgICAgICAgICAgICAgICBvblNlbGVjdGlvbkNoYW5nZT17dGhpcy5wcm9wcy5vblNlbGVjdGlvbkNoYW5nZX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuXG50eXBlIFJldmlzaW9uVGltZWxpbmVOb2RlUHJvcHMgPSB7XG4gIHJldmlzaW9uOiBSZXZpc2lvbkluZm87XG4gIGluZGV4OiBudW1iZXI7XG4gIHNlbGVjdGVkSW5kZXg6IG51bWJlcjtcbiAgcmV2aXNpb25zQ291bnQ6IG51bWJlcjtcbiAgb25TZWxlY3Rpb25DaGFuZ2U6IChyZXZpc2lvbkluZm86IFJldmlzaW9uSW5mbykgPT4gYW55O1xufTtcblxuY2xhc3MgUmV2aXNpb25UaW1lbGluZU5vZGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUmV2aXNpb25UaW1lbGluZU5vZGVQcm9wcztcblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB7cmV2aXNpb24sIGluZGV4LCBzZWxlY3RlZEluZGV4LCByZXZpc2lvbnNDb3VudH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtib29rbWFya3MsIHRpdGxlLCBhdXRob3IsIGhhc2gsIGRhdGV9ID0gcmV2aXNpb247XG4gICAgY29uc3QgcmV2aXNpb25DbGFzc05hbWUgPSBjbGFzc25hbWVzKHtcbiAgICAgIHJldmlzaW9uOiB0cnVlLFxuICAgICAgJ3NlbGVjdGVkLXJldmlzaW9uLWlucmFuZ2UnOiBpbmRleCA8IHNlbGVjdGVkSW5kZXgsXG4gICAgICAnc2VsZWN0ZWQtcmV2aXNpb24tc3RhcnQnOiBpbmRleCA9PT0gMCxcbiAgICAgICdzZWxlY3RlZC1yZXZpc2lvbi1lbmQnOiBpbmRleCA9PT0gc2VsZWN0ZWRJbmRleCxcbiAgICAgICdzZWxlY3RlZC1yZXZpc2lvbi1sYXN0JzogaW5kZXggPT09IHJldmlzaW9uc0NvdW50IC0gMSxcbiAgICB9KTtcbiAgICBjb25zdCB0b29sdGlwID0gYCR7aGFzaH06ICR7dGl0bGV9XG4gIEF1dGhvcjogJHthdXRob3J9XG4gIERhdGU6ICR7ZGF0ZX1gO1xuICAgIGNvbnN0IGJvb2ttYXJrc1RvUmVuZGVyID0gYm9va21hcmtzLnNsaWNlKCk7XG4gICAgLy8gQWRkIGBCQVNFYFxuICAgIGlmIChpbmRleCA9PT0gMCAmJiByZXZpc2lvbnNDb3VudCA+IDEgJiYgYm9va21hcmtzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgYm9va21hcmtzVG9SZW5kZXIucHVzaCgnSEVBRCcpO1xuICAgIH1cbiAgICBpZiAoaW5kZXggPT09IHJldmlzaW9uc0NvdW50IC0gMSAmJiBib29rbWFya3MubGVuZ3RoID09PSAwKSB7XG4gICAgICBib29rbWFya3NUb1JlbmRlci5wdXNoKCdCQVNFJyk7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT17cmV2aXNpb25DbGFzc05hbWV9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlU2VsZWN0aW9uQ2hhbmdlLmJpbmQodGhpcywgcmV2aXNpb24pfVxuICAgICAgICB0aXRsZT17dG9vbHRpcH0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmV2aXNpb24tYnViYmxlXCIgLz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZXZpc2lvbi1sYWJlbFwiPlxuICAgICAgICAgIHt0aXRsZX0gKHtib29rbWFya3NUb1JlbmRlci5sZW5ndGggPyBib29rbWFya3NUb1JlbmRlci5qb2luKCcsJykgOiBoYXNofSlcbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgaGFuZGxlU2VsZWN0aW9uQ2hhbmdlKCk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMub25TZWxlY3Rpb25DaGFuZ2UodGhpcy5wcm9wcy5yZXZpc2lvbik7XG4gIH1cbn1cbiJdfQ==