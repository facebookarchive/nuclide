var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atom = require('atom');

var _libFileTreeStore = require('../lib/FileTreeStore');

var _libFileTreeStore2 = _interopRequireDefault(_libFileTreeStore);

var _reactForAtom = require('react-for-atom');

var _RootNodeComponent = require('./RootNodeComponent');

var _RootNodeComponent2 = _interopRequireDefault(_RootNodeComponent);

var _EmptyComponent = require('./EmptyComponent');

var _EmptyComponent2 = _interopRequireDefault(_EmptyComponent);

var _analytics = require('../../analytics');

var _commons = require('../../commons');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var FileTree = (function (_React$Component) {
  _inherits(FileTree, _React$Component);

  _createClass(FileTree, null, [{
    key: 'trackFirstRender',
    value: (0, _commons.once)(function () {
      var rootKeysLength = _libFileTreeStore2['default'].getInstance().getRootKeys().length;
      // Wait using `setTimeout` and not `process.nextTick` or `setImmediate`
      // because those queue tasks in the current and next turn of the event loop
      // respectively. Since `setTimeout` gets preempted by them, it works great
      // for a more realistic "first render". Note: The scheduler for promises
      // (`Promise.resolve().then`) runs on the same queue as `process.nextTick`
      // but with a higher priority.
      setTimeout(function () {
        (0, _analytics.track)('filetree-first-render', {
          'time-to-render': String(process.uptime() * 1000),
          'root-keys': String(rootKeysLength)
        });
      });
    }),
    enumerable: true
  }]);

  function FileTree(props) {
    _classCallCheck(this, FileTree);

    _get(Object.getPrototypeOf(FileTree.prototype), 'constructor', this).call(this, props);
    this._subscriptions = new _atom.CompositeDisposable();
    this.state = {
      nodeToKeepInView: null
    };
    this._store = _libFileTreeStore2['default'].getInstance();
  }

  _createClass(FileTree, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      this._subscriptions.add(_libFileTreeStore2['default'].getInstance().subscribe(function () {
        var nodeToKeepInView = _libFileTreeStore2['default'].getInstance().getTrackedNode();
        if (nodeToKeepInView !== _this.state.nodeToKeepInView) {
          /*
           * Store a copy of `nodeToKeepInView` so the Store can update during this component's
           * rendering without wiping out the state of the node that needs to scroll into view.
           * Store events are fired synchronously, which means `getNodeToKeepInView` will return its
           * value for at least one `change` event.
           */
          _this.setState({ nodeToKeepInView: nodeToKeepInView });
        } else {
          // Note: It's safe to call forceUpdate here because the change events are de-bounced.
          _this.forceUpdate();
        }
      }));
      FileTree.trackFirstRender(this);
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevState.nodeToKeepInView != null) {
        /*
         * Scroll the node into view one final time after being reset to ensure final render is
         * complete before scrolling. Because the node is in `prevState`, check for its existence
         * before scrolling it.
         */
        var refNode = this.refs[prevState.nodeToKeepInView.rootKey];
        if (refNode != null) {
          refNode.scrollNodeIntoViewIfNeeded(prevState.nodeToKeepInView.nodeKey);
        }
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._subscriptions.dispose();
    }
  }, {
    key: 'render',
    value: function render() {
      var classes = {
        'nuclide-file-tree': true,
        'focusable-panel': true,
        'tree-view': true,
        'nuclide-file-tree-editing-working-set': this._store.isEditingWorkingSet()
      };

      return _reactForAtom.React.createElement(
        'div',
        { className: (0, _classnames2['default'])(classes), tabIndex: 0 },
        this._renderChildren()
      );
    }
  }, {
    key: '_renderChildren',
    value: function _renderChildren() {
      var workingSet = this._store.getWorkingSet();
      var isEditingWorkingSet = this._store.isEditingWorkingSet();

      var rootKeys = _libFileTreeStore2['default'].getInstance().getRootKeys().filter(function (rK) {
        if (workingSet == null || isEditingWorkingSet) {
          return true;
        }

        return workingSet.containsDir(rK);
      });
      if (rootKeys.length === 0) {
        return _reactForAtom.React.createElement(_EmptyComponent2['default'], null);
      }
      return rootKeys.map(function (rootKey) {
        return _reactForAtom.React.createElement(_RootNodeComponent2['default'], {
          key: rootKey,
          ref: rootKey,
          rootNode: _libFileTreeStore2['default'].getInstance().getRootNode(rootKey),
          rootKey: rootKey
        });
      });
    }
  }]);

  return FileTree;
})(_reactForAtom.React.Component);

module.exports = FileTree;
//# sourceMappingURL=data:application/json;base64,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LEVBQUUsQ0FBQztBQUMvQyxVQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzs7QUFFOUQsVUFBTSxRQUF1QixHQUFHLDhCQUFjLFdBQVcsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUN0RSxNQUFNLENBQUMsVUFBQSxFQUFFLEVBQUs7QUFDYixZQUFJLFVBQVUsSUFBSSxJQUFJLElBQUksbUJBQW1CLEVBQUU7QUFDN0MsaUJBQU8sSUFBSSxDQUFDO1NBQ2I7O0FBRUQsZUFBTyxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO09BQ25DLENBQUMsQ0FBQztBQUNMLFVBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDekIsZUFBTyxvRUFBa0IsQ0FBQztPQUMzQjtBQUNELGFBQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUM3QixlQUNFO0FBQ0UsYUFBRyxFQUFFLE9BQU8sQUFBQztBQUNiLGFBQUcsRUFBRSxPQUFPLEFBQUM7QUFDYixrQkFBUSxFQUFFLDhCQUFjLFdBQVcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQUFBQztBQUMzRCxpQkFBTyxFQUFFLE9BQU8sQUFBQztVQUNqQixDQUNGO09BQ0gsQ0FBQyxDQUFDO0tBQ0o7OztTQTdHRyxRQUFRO0dBQVMsb0JBQU0sU0FBUzs7QUFnSHRDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDIiwiZmlsZSI6IkZpbGVUcmVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0ZpbGVUcmVlTm9kZURhdGF9IGZyb20gJy4uL2xpYi9GaWxlVHJlZVN0b3JlJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBGaWxlVHJlZVN0b3JlIGZyb20gJy4uL2xpYi9GaWxlVHJlZVN0b3JlJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBSb290Tm9kZUNvbXBvbmVudCBmcm9tICcuL1Jvb3ROb2RlQ29tcG9uZW50JztcbmltcG9ydCBFbXB0eUNvbXBvbmVudCBmcm9tICcuL0VtcHR5Q29tcG9uZW50JztcbmltcG9ydCB7dHJhY2t9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5pbXBvcnQge29uY2V9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbnR5cGUgU3RhdGUgPSB7XG4gIG5vZGVUb0tlZXBJblZpZXc6ID9GaWxlVHJlZU5vZGVEYXRhO1xufTtcblxuY2xhc3MgRmlsZVRyZWUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0ZTogU3RhdGU7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfc3RvcmU6IEZpbGVUcmVlU3RvcmU7XG5cbiAgc3RhdGljIHRyYWNrRmlyc3RSZW5kZXIgPSBvbmNlKCgpID0+IHtcbiAgICBjb25zdCByb290S2V5c0xlbmd0aCA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKS5nZXRSb290S2V5cygpLmxlbmd0aDtcbiAgICAvLyBXYWl0IHVzaW5nIGBzZXRUaW1lb3V0YCBhbmQgbm90IGBwcm9jZXNzLm5leHRUaWNrYCBvciBgc2V0SW1tZWRpYXRlYFxuICAgIC8vIGJlY2F1c2UgdGhvc2UgcXVldWUgdGFza3MgaW4gdGhlIGN1cnJlbnQgYW5kIG5leHQgdHVybiBvZiB0aGUgZXZlbnQgbG9vcFxuICAgIC8vIHJlc3BlY3RpdmVseS4gU2luY2UgYHNldFRpbWVvdXRgIGdldHMgcHJlZW1wdGVkIGJ5IHRoZW0sIGl0IHdvcmtzIGdyZWF0XG4gICAgLy8gZm9yIGEgbW9yZSByZWFsaXN0aWMgXCJmaXJzdCByZW5kZXJcIi4gTm90ZTogVGhlIHNjaGVkdWxlciBmb3IgcHJvbWlzZXNcbiAgICAvLyAoYFByb21pc2UucmVzb2x2ZSgpLnRoZW5gKSBydW5zIG9uIHRoZSBzYW1lIHF1ZXVlIGFzIGBwcm9jZXNzLm5leHRUaWNrYFxuICAgIC8vIGJ1dCB3aXRoIGEgaGlnaGVyIHByaW9yaXR5LlxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdHJhY2soJ2ZpbGV0cmVlLWZpcnN0LXJlbmRlcicsIHtcbiAgICAgICAgJ3RpbWUtdG8tcmVuZGVyJzogU3RyaW5nKHByb2Nlc3MudXB0aW1lKCkgKiAxMDAwKSxcbiAgICAgICAgJ3Jvb3Qta2V5cyc6IFN0cmluZyhyb290S2V5c0xlbmd0aCksXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IHZvaWQpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIG5vZGVUb0tlZXBJblZpZXc6IG51bGwsXG4gICAgfTtcbiAgICB0aGlzLl9zdG9yZSA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vZGVUb0tlZXBJblZpZXcgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCkuZ2V0VHJhY2tlZE5vZGUoKTtcbiAgICAgICAgaWYgKG5vZGVUb0tlZXBJblZpZXcgIT09IHRoaXMuc3RhdGUubm9kZVRvS2VlcEluVmlldykge1xuICAgICAgICAgIC8qXG4gICAgICAgICAgICogU3RvcmUgYSBjb3B5IG9mIGBub2RlVG9LZWVwSW5WaWV3YCBzbyB0aGUgU3RvcmUgY2FuIHVwZGF0ZSBkdXJpbmcgdGhpcyBjb21wb25lbnQnc1xuICAgICAgICAgICAqIHJlbmRlcmluZyB3aXRob3V0IHdpcGluZyBvdXQgdGhlIHN0YXRlIG9mIHRoZSBub2RlIHRoYXQgbmVlZHMgdG8gc2Nyb2xsIGludG8gdmlldy5cbiAgICAgICAgICAgKiBTdG9yZSBldmVudHMgYXJlIGZpcmVkIHN5bmNocm9ub3VzbHksIHdoaWNoIG1lYW5zIGBnZXROb2RlVG9LZWVwSW5WaWV3YCB3aWxsIHJldHVybiBpdHNcbiAgICAgICAgICAgKiB2YWx1ZSBmb3IgYXQgbGVhc3Qgb25lIGBjaGFuZ2VgIGV2ZW50LlxuICAgICAgICAgICAqL1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe25vZGVUb0tlZXBJblZpZXd9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBOb3RlOiBJdCdzIHNhZmUgdG8gY2FsbCBmb3JjZVVwZGF0ZSBoZXJlIGJlY2F1c2UgdGhlIGNoYW5nZSBldmVudHMgYXJlIGRlLWJvdW5jZWQuXG4gICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICk7XG4gICAgRmlsZVRyZWUudHJhY2tGaXJzdFJlbmRlcih0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IHZvaWQsIHByZXZTdGF0ZTogT2JqZWN0KTogdm9pZCB7XG4gICAgaWYgKHByZXZTdGF0ZS5ub2RlVG9LZWVwSW5WaWV3ICE9IG51bGwpIHtcbiAgICAgIC8qXG4gICAgICAgKiBTY3JvbGwgdGhlIG5vZGUgaW50byB2aWV3IG9uZSBmaW5hbCB0aW1lIGFmdGVyIGJlaW5nIHJlc2V0IHRvIGVuc3VyZSBmaW5hbCByZW5kZXIgaXNcbiAgICAgICAqIGNvbXBsZXRlIGJlZm9yZSBzY3JvbGxpbmcuIEJlY2F1c2UgdGhlIG5vZGUgaXMgaW4gYHByZXZTdGF0ZWAsIGNoZWNrIGZvciBpdHMgZXhpc3RlbmNlXG4gICAgICAgKiBiZWZvcmUgc2Nyb2xsaW5nIGl0LlxuICAgICAgICovXG4gICAgICBjb25zdCByZWZOb2RlID0gdGhpcy5yZWZzW3ByZXZTdGF0ZS5ub2RlVG9LZWVwSW5WaWV3LnJvb3RLZXldO1xuICAgICAgaWYgKHJlZk5vZGUgIT0gbnVsbCkge1xuICAgICAgICByZWZOb2RlLnNjcm9sbE5vZGVJbnRvVmlld0lmTmVlZGVkKHByZXZTdGF0ZS5ub2RlVG9LZWVwSW5WaWV3Lm5vZGVLZXkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgY2xhc3NlcyA9IHtcbiAgICAgICdudWNsaWRlLWZpbGUtdHJlZSc6IHRydWUsXG4gICAgICAnZm9jdXNhYmxlLXBhbmVsJzogdHJ1ZSxcbiAgICAgICd0cmVlLXZpZXcnOiB0cnVlLFxuICAgICAgJ251Y2xpZGUtZmlsZS10cmVlLWVkaXRpbmctd29ya2luZy1zZXQnOiB0aGlzLl9zdG9yZS5pc0VkaXRpbmdXb3JraW5nU2V0KCksXG4gICAgfTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NuYW1lcyhjbGFzc2VzKX0gdGFiSW5kZXg9ezB9PlxuICAgICAgICB7dGhpcy5fcmVuZGVyQ2hpbGRyZW4oKX1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyQ2hpbGRyZW4oKTogUmVhY3RFbGVtZW50IHwgQXJyYXk8UmVhY3RFbGVtZW50PiB7XG4gICAgY29uc3Qgd29ya2luZ1NldCA9IHRoaXMuX3N0b3JlLmdldFdvcmtpbmdTZXQoKTtcbiAgICBjb25zdCBpc0VkaXRpbmdXb3JraW5nU2V0ID0gdGhpcy5fc3RvcmUuaXNFZGl0aW5nV29ya2luZ1NldCgpO1xuXG4gICAgY29uc3Qgcm9vdEtleXM6IEFycmF5PHN0cmluZz4gPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCkuZ2V0Um9vdEtleXMoKVxuICAgICAgLmZpbHRlcihySyA9PiAge1xuICAgICAgICBpZiAod29ya2luZ1NldCA9PSBudWxsIHx8IGlzRWRpdGluZ1dvcmtpbmdTZXQpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB3b3JraW5nU2V0LmNvbnRhaW5zRGlyKHJLKTtcbiAgICAgIH0pO1xuICAgIGlmIChyb290S2V5cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiA8RW1wdHlDb21wb25lbnQgLz47XG4gICAgfVxuICAgIHJldHVybiByb290S2V5cy5tYXAocm9vdEtleSA9PiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8Um9vdE5vZGVDb21wb25lbnRcbiAgICAgICAgICBrZXk9e3Jvb3RLZXl9XG4gICAgICAgICAgcmVmPXtyb290S2V5fVxuICAgICAgICAgIHJvb3ROb2RlPXtGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCkuZ2V0Um9vdE5vZGUocm9vdEtleSl9XG4gICAgICAgICAgcm9vdEtleT17cm9vdEtleX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlVHJlZTtcbiJdfQ==