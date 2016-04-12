var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _libFileTreeStore = require('../lib/FileTreeStore');

var _reactForAtom = require('react-for-atom');

var _DirectoryEntryComponent = require('./DirectoryEntryComponent');

var _EmptyComponent = require('./EmptyComponent');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideCommons = require('../../nuclide-commons');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var FileTree = (function (_React$Component) {
  _inherits(FileTree, _React$Component);

  _createClass(FileTree, null, [{
    key: 'trackFirstRender',
    value: (0, _nuclideCommons.once)(function () {
      var rootKeysLength = _libFileTreeStore.FileTreeStore.getInstance().roots.size;
      // Wait using `setTimeout` and not `process.nextTick` or `setImmediate`
      // because those queue tasks in the current and next turn of the event loop
      // respectively. Since `setTimeout` gets preempted by them, it works great
      // for a more realistic "first render". Note: The scheduler for promises
      // (`Promise.resolve().then`) runs on the same queue as `process.nextTick`
      // but with a higher priority.
      setTimeout(function () {
        (0, _nuclideAnalytics.track)('filetree-first-render', {
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
    this._store = _libFileTreeStore.FileTreeStore.getInstance();
  }

  _createClass(FileTree, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      FileTree.trackFirstRender(this);
      this._scrollToTrackedNodeIfNeeded();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this._scrollToTrackedNodeIfNeeded();
    }
  }, {
    key: '_scrollToTrackedNodeIfNeeded',
    value: function _scrollToTrackedNodeIfNeeded() {
      var trackedChild = this.refs['tracked'];
      if (trackedChild != null) {
        trackedChild.scrollTrackedIntoView();
      }
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
      var roots = _libFileTreeStore.FileTreeStore.getInstance().roots;

      if (roots.isEmpty()) {
        return _reactForAtom.React.createElement(_EmptyComponent.EmptyComponent, null);
      }

      var children = roots.filter(function (root) {
        return root.shouldBeShown;
      }).toArray().map(function (root, index) {
        if (root.containsTrackedNode) {
          return _reactForAtom.React.createElement(_DirectoryEntryComponent.DirectoryEntryComponent, { key: index, node: root, ref: 'tracked' });
        } else {
          return _reactForAtom.React.createElement(_DirectoryEntryComponent.DirectoryEntryComponent, { key: index, node: root });
        }
      });
      return _reactForAtom.React.createElement(
        'ul',
        { className: 'list-tree has-collapsable-children' },
        children
      );
    }
  }]);

  return FileTree;
})(_reactForAtom.React.Component);

module.exports = FileTree;
//# sourceMappingURL=data:application/json;base64,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RnRDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDIiwiZmlsZSI6IkZpbGVUcmVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuXG5pbXBvcnQge0ZpbGVUcmVlU3RvcmV9IGZyb20gJy4uL2xpYi9GaWxlVHJlZVN0b3JlJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7RGlyZWN0b3J5RW50cnlDb21wb25lbnR9IGZyb20gJy4vRGlyZWN0b3J5RW50cnlDb21wb25lbnQnO1xuaW1wb3J0IHtFbXB0eUNvbXBvbmVudH0gZnJvbSAnLi9FbXB0eUNvbXBvbmVudCc7XG5pbXBvcnQge3RyYWNrfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQge29uY2V9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxuY2xhc3MgRmlsZVRyZWUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0ZTogT2JqZWN0O1xuICBfc3RvcmU6IEZpbGVUcmVlU3RvcmU7XG5cbiAgc3RhdGljIHRyYWNrRmlyc3RSZW5kZXIgPSBvbmNlKCgpID0+IHtcbiAgICBjb25zdCByb290S2V5c0xlbmd0aCA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKS5yb290cy5zaXplO1xuICAgIC8vIFdhaXQgdXNpbmcgYHNldFRpbWVvdXRgIGFuZCBub3QgYHByb2Nlc3MubmV4dFRpY2tgIG9yIGBzZXRJbW1lZGlhdGVgXG4gICAgLy8gYmVjYXVzZSB0aG9zZSBxdWV1ZSB0YXNrcyBpbiB0aGUgY3VycmVudCBhbmQgbmV4dCB0dXJuIG9mIHRoZSBldmVudCBsb29wXG4gICAgLy8gcmVzcGVjdGl2ZWx5LiBTaW5jZSBgc2V0VGltZW91dGAgZ2V0cyBwcmVlbXB0ZWQgYnkgdGhlbSwgaXQgd29ya3MgZ3JlYXRcbiAgICAvLyBmb3IgYSBtb3JlIHJlYWxpc3RpYyBcImZpcnN0IHJlbmRlclwiLiBOb3RlOiBUaGUgc2NoZWR1bGVyIGZvciBwcm9taXNlc1xuICAgIC8vIChgUHJvbWlzZS5yZXNvbHZlKCkudGhlbmApIHJ1bnMgb24gdGhlIHNhbWUgcXVldWUgYXMgYHByb2Nlc3MubmV4dFRpY2tgXG4gICAgLy8gYnV0IHdpdGggYSBoaWdoZXIgcHJpb3JpdHkuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0cmFjaygnZmlsZXRyZWUtZmlyc3QtcmVuZGVyJywge1xuICAgICAgICAndGltZS10by1yZW5kZXInOiBTdHJpbmcocHJvY2Vzcy51cHRpbWUoKSAqIDEwMDApLFxuICAgICAgICAncm9vdC1rZXlzJzogU3RyaW5nKHJvb3RLZXlzTGVuZ3RoKSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogdm9pZCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9zdG9yZSA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIEZpbGVUcmVlLnRyYWNrRmlyc3RSZW5kZXIodGhpcyk7XG4gICAgdGhpcy5fc2Nyb2xsVG9UcmFja2VkTm9kZUlmTmVlZGVkKCk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5fc2Nyb2xsVG9UcmFja2VkTm9kZUlmTmVlZGVkKCk7XG4gIH1cblxuICBfc2Nyb2xsVG9UcmFja2VkTm9kZUlmTmVlZGVkKCk6IHZvaWQge1xuICAgIGNvbnN0IHRyYWNrZWRDaGlsZCA9IHRoaXMucmVmc1sndHJhY2tlZCddO1xuICAgIGlmICh0cmFja2VkQ2hpbGQgIT0gbnVsbCkge1xuICAgICAgdHJhY2tlZENoaWxkLnNjcm9sbFRyYWNrZWRJbnRvVmlldygpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGNsYXNzZXMgPSB7XG4gICAgICAnbnVjbGlkZS1maWxlLXRyZWUnOiB0cnVlLFxuICAgICAgJ2ZvY3VzYWJsZS1wYW5lbCc6IHRydWUsXG4gICAgICAndHJlZS12aWV3JzogdHJ1ZSxcbiAgICAgICdudWNsaWRlLWZpbGUtdHJlZS1lZGl0aW5nLXdvcmtpbmctc2V0JzogdGhpcy5fc3RvcmUuaXNFZGl0aW5nV29ya2luZ1NldCgpLFxuICAgIH07XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzbmFtZXMoY2xhc3Nlcyl9IHRhYkluZGV4PXswfT5cbiAgICAgICAge3RoaXMuX3JlbmRlckNoaWxkcmVuKCl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX3JlbmRlckNoaWxkcmVuKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qgcm9vdHMgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCkucm9vdHM7XG5cbiAgICBpZiAocm9vdHMuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm4gPEVtcHR5Q29tcG9uZW50IC8+O1xuICAgIH1cblxuICAgIGNvbnN0IGNoaWxkcmVuID0gcm9vdHMuZmlsdGVyKHJvb3QgPT4gcm9vdC5zaG91bGRCZVNob3duKVxuICAgICAgLnRvQXJyYXkoKVxuICAgICAgLm1hcCgocm9vdCwgaW5kZXgpID0+IHtcbiAgICAgICAgaWYgKHJvb3QuY29udGFpbnNUcmFja2VkTm9kZSkge1xuICAgICAgICAgIHJldHVybiA8RGlyZWN0b3J5RW50cnlDb21wb25lbnQga2V5PXtpbmRleH0gbm9kZT17cm9vdH0gcmVmPVwidHJhY2tlZFwiIC8+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiA8RGlyZWN0b3J5RW50cnlDb21wb25lbnQga2V5PXtpbmRleH0gbm9kZT17cm9vdH0gLz47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIHJldHVybiAoXG4gICAgICA8dWwgY2xhc3NOYW1lPVwibGlzdC10cmVlIGhhcy1jb2xsYXBzYWJsZS1jaGlsZHJlblwiPlxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L3VsPlxuICAgICk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlVHJlZTtcbiJdfQ==