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
    this._store = _libFileTreeStore2['default'].getInstance();
  }

  _createClass(FileTree, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      FileTree.trackFirstRender(this);
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevProps.nodeToKeepInView != null) {
        /*
         * Scroll the node into view one final time after being reset to ensure final render is
         * complete before scrolling. Because the node is in `prevProps`, check for its existence
         * before scrolling it.
         */
        var refNode = this.refs[prevProps.nodeToKeepInView.rootKey];
        if (refNode != null) {
          refNode.scrollNodeIntoViewIfNeeded(prevProps.nodeToKeepInView.nodeKey);
        }
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
//# sourceMappingURL=data:application/json;base64,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LFdBQVcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQUFBQztBQUMzRCxpQkFBTyxFQUFFLE9BQU8sQUFBQztVQUNqQixDQUNGO09BQ0gsQ0FBQyxDQUFDO0tBQ0o7OztTQXBGRyxRQUFRO0dBQVMsb0JBQU0sU0FBUzs7QUF1RnRDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDIiwiZmlsZSI6IkZpbGVUcmVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0ZpbGVUcmVlTm9kZURhdGF9IGZyb20gJy4uL2xpYi9GaWxlVHJlZVN0b3JlJztcblxuaW1wb3J0IEZpbGVUcmVlU3RvcmUgZnJvbSAnLi4vbGliL0ZpbGVUcmVlU3RvcmUnO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IFJvb3ROb2RlQ29tcG9uZW50IGZyb20gJy4vUm9vdE5vZGVDb21wb25lbnQnO1xuaW1wb3J0IEVtcHR5Q29tcG9uZW50IGZyb20gJy4vRW1wdHlDb21wb25lbnQnO1xuaW1wb3J0IHt0cmFja30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCB7b25jZX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxudHlwZSBQcm9wcyA9IHtcbiAgbm9kZVRvS2VlcEluVmlldzogP0ZpbGVUcmVlTm9kZURhdGE7XG59O1xuXG5jbGFzcyBGaWxlVHJlZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcbiAgc3RhdGU6IE9iamVjdDtcbiAgX3N0b3JlOiBGaWxlVHJlZVN0b3JlO1xuXG4gIHN0YXRpYyB0cmFja0ZpcnN0UmVuZGVyID0gb25jZSgoKSA9PiB7XG4gICAgY29uc3Qgcm9vdEtleXNMZW5ndGggPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCkuZ2V0Um9vdEtleXMoKS5sZW5ndGg7XG4gICAgLy8gV2FpdCB1c2luZyBgc2V0VGltZW91dGAgYW5kIG5vdCBgcHJvY2Vzcy5uZXh0VGlja2Agb3IgYHNldEltbWVkaWF0ZWBcbiAgICAvLyBiZWNhdXNlIHRob3NlIHF1ZXVlIHRhc2tzIGluIHRoZSBjdXJyZW50IGFuZCBuZXh0IHR1cm4gb2YgdGhlIGV2ZW50IGxvb3BcbiAgICAvLyByZXNwZWN0aXZlbHkuIFNpbmNlIGBzZXRUaW1lb3V0YCBnZXRzIHByZWVtcHRlZCBieSB0aGVtLCBpdCB3b3JrcyBncmVhdFxuICAgIC8vIGZvciBhIG1vcmUgcmVhbGlzdGljIFwiZmlyc3QgcmVuZGVyXCIuIE5vdGU6IFRoZSBzY2hlZHVsZXIgZm9yIHByb21pc2VzXG4gICAgLy8gKGBQcm9taXNlLnJlc29sdmUoKS50aGVuYCkgcnVucyBvbiB0aGUgc2FtZSBxdWV1ZSBhcyBgcHJvY2Vzcy5uZXh0VGlja2BcbiAgICAvLyBidXQgd2l0aCBhIGhpZ2hlciBwcmlvcml0eS5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRyYWNrKCdmaWxldHJlZS1maXJzdC1yZW5kZXInLCB7XG4gICAgICAgICd0aW1lLXRvLXJlbmRlcic6IFN0cmluZyhwcm9jZXNzLnVwdGltZSgpICogMTAwMCksXG4gICAgICAgICdyb290LWtleXMnOiBTdHJpbmcocm9vdEtleXNMZW5ndGgpLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiB2b2lkKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX3N0b3JlID0gRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgRmlsZVRyZWUudHJhY2tGaXJzdFJlbmRlcih0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IFByb3BzLCBwcmV2U3RhdGU6IE9iamVjdCk6IHZvaWQge1xuICAgIGlmIChwcmV2UHJvcHMubm9kZVRvS2VlcEluVmlldyAhPSBudWxsKSB7XG4gICAgICAvKlxuICAgICAgICogU2Nyb2xsIHRoZSBub2RlIGludG8gdmlldyBvbmUgZmluYWwgdGltZSBhZnRlciBiZWluZyByZXNldCB0byBlbnN1cmUgZmluYWwgcmVuZGVyIGlzXG4gICAgICAgKiBjb21wbGV0ZSBiZWZvcmUgc2Nyb2xsaW5nLiBCZWNhdXNlIHRoZSBub2RlIGlzIGluIGBwcmV2UHJvcHNgLCBjaGVjayBmb3IgaXRzIGV4aXN0ZW5jZVxuICAgICAgICogYmVmb3JlIHNjcm9sbGluZyBpdC5cbiAgICAgICAqL1xuICAgICAgY29uc3QgcmVmTm9kZSA9IHRoaXMucmVmc1twcmV2UHJvcHMubm9kZVRvS2VlcEluVmlldy5yb290S2V5XTtcbiAgICAgIGlmIChyZWZOb2RlICE9IG51bGwpIHtcbiAgICAgICAgcmVmTm9kZS5zY3JvbGxOb2RlSW50b1ZpZXdJZk5lZWRlZChwcmV2UHJvcHMubm9kZVRvS2VlcEluVmlldy5ub2RlS2V5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBjbGFzc2VzID0ge1xuICAgICAgJ251Y2xpZGUtZmlsZS10cmVlJzogdHJ1ZSxcbiAgICAgICdmb2N1c2FibGUtcGFuZWwnOiB0cnVlLFxuICAgICAgJ3RyZWUtdmlldyc6IHRydWUsXG4gICAgICAnbnVjbGlkZS1maWxlLXRyZWUtZWRpdGluZy13b3JraW5nLXNldCc6IHRoaXMuX3N0b3JlLmlzRWRpdGluZ1dvcmtpbmdTZXQoKSxcbiAgICB9O1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc25hbWVzKGNsYXNzZXMpfSB0YWJJbmRleD17MH0+XG4gICAgICAgIHt0aGlzLl9yZW5kZXJDaGlsZHJlbigpfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9yZW5kZXJDaGlsZHJlbigpOiBSZWFjdEVsZW1lbnQgfCBBcnJheTxSZWFjdEVsZW1lbnQ+IHtcbiAgICBjb25zdCB3b3JraW5nU2V0ID0gdGhpcy5fc3RvcmUuZ2V0V29ya2luZ1NldCgpO1xuICAgIGNvbnN0IGlzRWRpdGluZ1dvcmtpbmdTZXQgPSB0aGlzLl9zdG9yZS5pc0VkaXRpbmdXb3JraW5nU2V0KCk7XG5cbiAgICBjb25zdCByb290S2V5czogQXJyYXk8c3RyaW5nPiA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKS5nZXRSb290S2V5cygpXG4gICAgICAuZmlsdGVyKHJLID0+ICB7XG4gICAgICAgIGlmICh3b3JraW5nU2V0ID09IG51bGwgfHwgaXNFZGl0aW5nV29ya2luZ1NldCkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHdvcmtpbmdTZXQuY29udGFpbnNEaXIockspO1xuICAgICAgfSk7XG4gICAgaWYgKHJvb3RLZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIDxFbXB0eUNvbXBvbmVudCAvPjtcbiAgICB9XG4gICAgcmV0dXJuIHJvb3RLZXlzLm1hcChyb290S2V5ID0+IHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxSb290Tm9kZUNvbXBvbmVudFxuICAgICAgICAgIGtleT17cm9vdEtleX1cbiAgICAgICAgICByZWY9e3Jvb3RLZXl9XG4gICAgICAgICAgcm9vdE5vZGU9e0ZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKS5nZXRSb290Tm9kZShyb290S2V5KX1cbiAgICAgICAgICByb290S2V5PXtyb290S2V5fVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVUcmVlO1xuIl19