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

var _nuclideCommons = require('../../nuclide-commons');

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
      var selectedIndex = _nuclideCommons.array.findIndex(latestToOldestRevisions, function (revision) {
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
//# sourceMappingURL=data:application/json;base64,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QUFjLEdBQUcsQ0FBQztPQUN2RCxDQUFDLENBQUM7QUFDSCxVQUFNLE9BQU8sR0FBTSxJQUFJLFVBQUssS0FBSyxvQkFDekIsTUFBTSxrQkFDUixJQUFJLEFBQUUsQ0FBQztBQUNiLFVBQU0saUJBQWlCLEdBQUcsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUU1QyxVQUFJLEtBQUssS0FBSyxDQUFDLElBQUksY0FBYyxHQUFHLENBQUMsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUMvRCx5QkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDaEM7QUFDRCxVQUFJLEtBQUssS0FBSyxjQUFjLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzFELHlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUNoQztBQUNELGFBQ0U7OztBQUNFLG1CQUFTLEVBQUUsaUJBQWlCLEFBQUM7QUFDN0IsaUJBQU8sRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQUFBQztBQUN6RCxlQUFLLEVBQUUsT0FBTyxBQUFDO1FBQ2YsMkNBQUssU0FBUyxFQUFDLGlCQUFpQixHQUFHO1FBQ25DOztZQUFLLFNBQVMsRUFBQyxnQkFBZ0I7VUFDNUIsS0FBSzs7VUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUk7O1NBQ25FO09BQ0YsQ0FDTjtLQUNIOzs7V0FFb0IsaUNBQVM7QUFDNUIsVUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ25EOzs7U0F2Q0csb0JBQW9CO0dBQVMsb0JBQU0sU0FBUyIsImZpbGUiOiJEaWZmVGltZWxpbmVWaWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgRGlmZlZpZXdNb2RlbCBmcm9tICcuL0RpZmZWaWV3TW9kZWwnO1xuaW1wb3J0IHR5cGUge1JldmlzaW9uc1N0YXRlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtSZXZpc2lvbkluZm99IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9IZ1NlcnZpY2UnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbnR5cGUgRGlmZlRpbWVsaW5lVmlld1Byb3BzID0ge1xuICBkaWZmTW9kZWw6IERpZmZWaWV3TW9kZWw7XG4gIG9uU2VsZWN0aW9uQ2hhbmdlOiAocmV2aXNpb25JbmZvOiBSZXZpc2lvbkluZm8pID0+IGFueTtcbn07XG5cbnR5cGUgRGlmZlRpbWVsaW5lVmlld1N0YXRlID0ge1xuICByZXZpc2lvbnNTdGF0ZTogP1JldmlzaW9uc1N0YXRlO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlmZlRpbWVsaW5lVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBEaWZmVGltZWxpbmVWaWV3UHJvcHM7XG4gIHN0YXRlOiBEaWZmVGltZWxpbmVWaWV3U3RhdGU7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBEaWZmVGltZWxpbmVWaWV3UHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgY29uc3Qge2RpZmZNb2RlbH0gPSBwcm9wcztcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgcmV2aXNpb25zU3RhdGU6IG51bGwsXG4gICAgfTtcbiAgICBjb25zdCBib3VuZFVwZGF0ZVJldmlzaW9ucyA9IHRoaXMuX3VwZGF0ZVJldmlzaW9ucy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgZGlmZk1vZGVsLm9uUmV2aXNpb25zVXBkYXRlKGJvdW5kVXBkYXRlUmV2aXNpb25zKVxuICAgICk7XG4gICAgZGlmZk1vZGVsLmdldEFjdGl2ZVJldmlzaW9uc1N0YXRlKCkudGhlbihib3VuZFVwZGF0ZVJldmlzaW9ucyk7XG4gIH1cblxuICBfdXBkYXRlUmV2aXNpb25zKG5ld1JldmlzaW9uc1N0YXRlOiA/UmV2aXNpb25zU3RhdGUpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHJldmlzaW9uc1N0YXRlOiBuZXdSZXZpc2lvbnNTdGF0ZSxcbiAgICB9KTtcbiAgfVxuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICBsZXQgY29udGVudCA9IG51bGw7XG4gICAgY29uc3Qge3JldmlzaW9uc1N0YXRlfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKHJldmlzaW9uc1N0YXRlID09IG51bGwpIHtcbiAgICAgIGNvbnRlbnQgPSAnUmV2aXNpb25zIG5vdCBsb2FkZWQuLi4nO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB7cmV2aXNpb25zLCBjb21wYXJlQ29tbWl0SWQsIGNvbW1pdElkfSA9IHJldmlzaW9uc1N0YXRlO1xuICAgICAgY29udGVudCA9IChcbiAgICAgICAgPFJldmlzaW9uc1RpbWVsaW5lQ29tcG9uZW50XG4gICAgICAgICAgcmV2aXNpb25zPXtyZXZpc2lvbnN9XG4gICAgICAgICAgY29tcGFyZVJldmlzaW9uSWQ9e2NvbXBhcmVDb21taXRJZCB8fCBjb21taXRJZH1cbiAgICAgICAgICBvblNlbGVjdGlvbkNoYW5nZT17dGhpcy5wcm9wcy5vblNlbGVjdGlvbkNoYW5nZX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRpZmYtdGltZWxpbmUgcGFkZGVkXCI+XG4gICAgICAgIHtjb250ZW50fVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIGhhbmRsZVNlbGVjdGlvbkNoYW5nZShyZXZpc2lvbjogUmV2aXNpb25JbmZvKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5vblNlbGVjdGlvbkNoYW5nZShyZXZpc2lvbik7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG50eXBlIFJldmlzaW9uc0NvbXBvbmVudFByb3BzID0ge1xuICByZXZpc2lvbnM6IEFycmF5PFJldmlzaW9uSW5mbz47XG4gIGNvbXBhcmVSZXZpc2lvbklkOiBudW1iZXI7XG4gIG9uU2VsZWN0aW9uQ2hhbmdlOiAocmV2aXNpb25JbmZvOiBSZXZpc2lvbkluZm8pID0+IGFueTtcbn07XG5cbmNsYXNzIFJldmlzaW9uc1RpbWVsaW5lQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFJldmlzaW9uc0NvbXBvbmVudFByb3BzO1xuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHtyZXZpc2lvbnMsIGNvbXBhcmVSZXZpc2lvbklkfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnMgPSByZXZpc2lvbnMuc2xpY2UoKS5yZXZlcnNlKCk7XG4gICAgY29uc3Qgc2VsZWN0ZWRJbmRleCA9IGFycmF5LmZpbmRJbmRleChcbiAgICAgIGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zLFxuICAgICAgcmV2aXNpb24gPT4gcmV2aXNpb24uaWQgPT09IGNvbXBhcmVSZXZpc2lvbklkXG4gICAgKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInJldmlzaW9uLXRpbWVsaW5lLXdyYXBcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZXZpc2lvbi1zZWxlY3RvclwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmV2aXNpb25zXCI+XG4gICAgICAgICAgICB7bGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnMubWFwKChyZXZpc2lvbiwgaSkgPT5cbiAgICAgICAgICAgICAgPFJldmlzaW9uVGltZWxpbmVOb2RlXG4gICAgICAgICAgICAgICAgaW5kZXg9e2l9XG4gICAgICAgICAgICAgICAga2V5PXtyZXZpc2lvbi5oYXNofVxuICAgICAgICAgICAgICAgIHNlbGVjdGVkSW5kZXg9e3NlbGVjdGVkSW5kZXh9XG4gICAgICAgICAgICAgICAgcmV2aXNpb249e3JldmlzaW9ufVxuICAgICAgICAgICAgICAgIHJldmlzaW9uc0NvdW50PXtyZXZpc2lvbnMubGVuZ3RofVxuICAgICAgICAgICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlPXt0aGlzLnByb3BzLm9uU2VsZWN0aW9uQ2hhbmdlfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG5cbnR5cGUgUmV2aXNpb25UaW1lbGluZU5vZGVQcm9wcyA9IHtcbiAgcmV2aXNpb246IFJldmlzaW9uSW5mbztcbiAgaW5kZXg6IG51bWJlcjtcbiAgc2VsZWN0ZWRJbmRleDogbnVtYmVyO1xuICByZXZpc2lvbnNDb3VudDogbnVtYmVyO1xuICBvblNlbGVjdGlvbkNoYW5nZTogKHJldmlzaW9uSW5mbzogUmV2aXNpb25JbmZvKSA9PiBhbnk7XG59O1xuXG5jbGFzcyBSZXZpc2lvblRpbWVsaW5lTm9kZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBSZXZpc2lvblRpbWVsaW5lTm9kZVByb3BzO1xuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHtyZXZpc2lvbiwgaW5kZXgsIHNlbGVjdGVkSW5kZXgsIHJldmlzaW9uc0NvdW50fSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge2Jvb2ttYXJrcywgdGl0bGUsIGF1dGhvciwgaGFzaCwgZGF0ZX0gPSByZXZpc2lvbjtcbiAgICBjb25zdCByZXZpc2lvbkNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoe1xuICAgICAgcmV2aXNpb246IHRydWUsXG4gICAgICAnc2VsZWN0ZWQtcmV2aXNpb24taW5yYW5nZSc6IGluZGV4IDwgc2VsZWN0ZWRJbmRleCxcbiAgICAgICdzZWxlY3RlZC1yZXZpc2lvbi1zdGFydCc6IGluZGV4ID09PSAwLFxuICAgICAgJ3NlbGVjdGVkLXJldmlzaW9uLWVuZCc6IGluZGV4ID09PSBzZWxlY3RlZEluZGV4LFxuICAgICAgJ3NlbGVjdGVkLXJldmlzaW9uLWxhc3QnOiBpbmRleCA9PT0gcmV2aXNpb25zQ291bnQgLSAxLFxuICAgIH0pO1xuICAgIGNvbnN0IHRvb2x0aXAgPSBgJHtoYXNofTogJHt0aXRsZX1cbiAgQXV0aG9yOiAke2F1dGhvcn1cbiAgRGF0ZTogJHtkYXRlfWA7XG4gICAgY29uc3QgYm9va21hcmtzVG9SZW5kZXIgPSBib29rbWFya3Muc2xpY2UoKTtcbiAgICAvLyBBZGQgYEJBU0VgXG4gICAgaWYgKGluZGV4ID09PSAwICYmIHJldmlzaW9uc0NvdW50ID4gMSAmJiBib29rbWFya3MubGVuZ3RoID09PSAwKSB7XG4gICAgICBib29rbWFya3NUb1JlbmRlci5wdXNoKCdIRUFEJyk7XG4gICAgfVxuICAgIGlmIChpbmRleCA9PT0gcmV2aXNpb25zQ291bnQgLSAxICYmIGJvb2ttYXJrcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGJvb2ttYXJrc1RvUmVuZGVyLnB1c2goJ0JBU0UnKTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPXtyZXZpc2lvbkNsYXNzTmFtZX1cbiAgICAgICAgb25DbGljaz17dGhpcy5oYW5kbGVTZWxlY3Rpb25DaGFuZ2UuYmluZCh0aGlzLCByZXZpc2lvbil9XG4gICAgICAgIHRpdGxlPXt0b29sdGlwfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZXZpc2lvbi1idWJibGVcIiAvPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJldmlzaW9uLWxhYmVsXCI+XG4gICAgICAgICAge3RpdGxlfSAoe2Jvb2ttYXJrc1RvUmVuZGVyLmxlbmd0aCA/IGJvb2ttYXJrc1RvUmVuZGVyLmpvaW4oJywnKSA6IGhhc2h9KVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UoKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5vblNlbGVjdGlvbkNoYW5nZSh0aGlzLnByb3BzLnJldmlzaW9uKTtcbiAgfVxufVxuIl19