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
      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-file-tree focusable-panel tree-view', tabIndex: 0 },
        this._renderChildren()
      );
    }
  }, {
    key: '_renderChildren',
    value: function _renderChildren() {
      var rootKeys = _libFileTreeStore2['default'].getInstance().getRootKeys();
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
//# sourceMappingURL=data:application/json;base64,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QUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxBQUFDO0FBQzNELGlCQUFPLEVBQUUsT0FBTyxBQUFDO1VBQ2pCLENBQ0Y7T0FDSCxDQUFDLENBQUM7S0FDSjs7O1NBekZHLFFBQVE7R0FBUyxvQkFBTSxTQUFTOztBQTRGdEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMiLCJmaWxlIjoiRmlsZVRyZWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IEZpbGVUcmVlU3RvcmUgZnJvbSAnLi4vbGliL0ZpbGVUcmVlU3RvcmUnO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IFJvb3ROb2RlQ29tcG9uZW50IGZyb20gJy4vUm9vdE5vZGVDb21wb25lbnQnO1xuaW1wb3J0IEVtcHR5Q29tcG9uZW50IGZyb20gJy4vRW1wdHlDb21wb25lbnQnO1xuaW1wb3J0IHt0cmFja30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCB7b25jZX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5cbmNsYXNzIEZpbGVUcmVlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgc3RhdGljIHRyYWNrRmlyc3RSZW5kZXIgPSBvbmNlKCgpID0+IHtcbiAgICBjb25zdCByb290S2V5c0xlbmd0aCA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKS5nZXRSb290S2V5cygpLmxlbmd0aDtcbiAgICAvLyBXYWl0IHVzaW5nIGBzZXRUaW1lb3V0YCBhbmQgbm90IGBwcm9jZXNzLm5leHRUaWNrYCBvciBgc2V0SW1tZWRpYXRlYFxuICAgIC8vIGJlY2F1c2UgdGhvc2UgcXVldWUgdGFza3MgaW4gdGhlIGN1cnJlbnQgYW5kIG5leHQgdHVybiBvZiB0aGUgZXZlbnQgbG9vcFxuICAgIC8vIHJlc3BlY3RpdmVseS4gU2luY2UgYHNldFRpbWVvdXRgIGdldHMgcHJlZW1wdGVkIGJ5IHRoZW0sIGl0IHdvcmtzIGdyZWF0XG4gICAgLy8gZm9yIGEgbW9yZSByZWFsaXN0aWMgXCJmaXJzdCByZW5kZXJcIi4gTm90ZTogVGhlIHNjaGVkdWxlciBmb3IgcHJvbWlzZXNcbiAgICAvLyAoYFByb21pc2UucmVzb2x2ZSgpLnRoZW5gKSBydW5zIG9uIHRoZSBzYW1lIHF1ZXVlIGFzIGBwcm9jZXNzLm5leHRUaWNrYFxuICAgIC8vIGJ1dCB3aXRoIGEgaGlnaGVyIHByaW9yaXR5LlxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdHJhY2soJ2ZpbGV0cmVlLWZpcnN0LXJlbmRlcicsIHtcbiAgICAgICAgJ3RpbWUtdG8tcmVuZGVyJzogU3RyaW5nKHByb2Nlc3MudXB0aW1lKCkgKiAxMDAwKSxcbiAgICAgICAgJ3Jvb3Qta2V5cyc6IFN0cmluZyhyb290S2V5c0xlbmd0aCksXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgbm9kZVRvS2VlcEluVmlldzogbnVsbCxcbiAgICB9O1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgY29uc3Qgbm9kZVRvS2VlcEluVmlldyA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKS5nZXRUcmFja2VkTm9kZSgpO1xuICAgICAgICBpZiAobm9kZVRvS2VlcEluVmlldyAhPT0gdGhpcy5zdGF0ZS5ub2RlVG9LZWVwSW5WaWV3KSB7XG4gICAgICAgICAgLypcbiAgICAgICAgICAgKiBTdG9yZSBhIGNvcHkgb2YgYG5vZGVUb0tlZXBJblZpZXdgIHNvIHRoZSBTdG9yZSBjYW4gdXBkYXRlIGR1cmluZyB0aGlzIGNvbXBvbmVudCdzXG4gICAgICAgICAgICogcmVuZGVyaW5nIHdpdGhvdXQgd2lwaW5nIG91dCB0aGUgc3RhdGUgb2YgdGhlIG5vZGUgdGhhdCBuZWVkcyB0byBzY3JvbGwgaW50byB2aWV3LlxuICAgICAgICAgICAqIFN0b3JlIGV2ZW50cyBhcmUgZmlyZWQgc3luY2hyb25vdXNseSwgd2hpY2ggbWVhbnMgYGdldE5vZGVUb0tlZXBJblZpZXdgIHdpbGwgcmV0dXJuIGl0c1xuICAgICAgICAgICAqIHZhbHVlIGZvciBhdCBsZWFzdCBvbmUgYGNoYW5nZWAgZXZlbnQuXG4gICAgICAgICAgICovXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bm9kZVRvS2VlcEluVmlld30pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE5vdGU6IEl0J3Mgc2FmZSB0byBjYWxsIGZvcmNlVXBkYXRlIGhlcmUgYmVjYXVzZSB0aGUgY2hhbmdlIGV2ZW50cyBhcmUgZGUtYm91bmNlZC5cbiAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgKTtcbiAgICBGaWxlVHJlZS50cmFja0ZpcnN0UmVuZGVyKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogT2JqZWN0LCBwcmV2U3RhdGU6IE9iamVjdCk6IHZvaWQge1xuICAgIGlmIChwcmV2U3RhdGUubm9kZVRvS2VlcEluVmlldyAhPSBudWxsKSB7XG4gICAgICAvKlxuICAgICAgICogU2Nyb2xsIHRoZSBub2RlIGludG8gdmlldyBvbmUgZmluYWwgdGltZSBhZnRlciBiZWluZyByZXNldCB0byBlbnN1cmUgZmluYWwgcmVuZGVyIGlzXG4gICAgICAgKiBjb21wbGV0ZSBiZWZvcmUgc2Nyb2xsaW5nLiBCZWNhdXNlIHRoZSBub2RlIGlzIGluIGBwcmV2U3RhdGVgLCBjaGVjayBmb3IgaXRzIGV4aXN0ZW5jZVxuICAgICAgICogYmVmb3JlIHNjcm9sbGluZyBpdC5cbiAgICAgICAqL1xuICAgICAgY29uc3QgcmVmTm9kZSA9IHRoaXMucmVmc1twcmV2U3RhdGUubm9kZVRvS2VlcEluVmlldy5yb290S2V5XTtcbiAgICAgIGlmIChyZWZOb2RlICE9IG51bGwpIHtcbiAgICAgICAgcmVmTm9kZS5zY3JvbGxOb2RlSW50b1ZpZXdJZk5lZWRlZChwcmV2U3RhdGUubm9kZVRvS2VlcEluVmlldy5ub2RlS2V5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZmlsZS10cmVlIGZvY3VzYWJsZS1wYW5lbCB0cmVlLXZpZXdcIiB0YWJJbmRleD17MH0+XG4gICAgICAgIHt0aGlzLl9yZW5kZXJDaGlsZHJlbigpfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9yZW5kZXJDaGlsZHJlbigpOiBSZWFjdEVsZW1lbnQgfCBBcnJheTxSZWFjdEVsZW1lbnQ+IHtcbiAgICBjb25zdCByb290S2V5czogQXJyYXk8c3RyaW5nPiA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKS5nZXRSb290S2V5cygpO1xuICAgIGlmIChyb290S2V5cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiA8RW1wdHlDb21wb25lbnQgLz47XG4gICAgfVxuICAgIHJldHVybiByb290S2V5cy5tYXAocm9vdEtleSA9PiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8Um9vdE5vZGVDb21wb25lbnRcbiAgICAgICAgICBrZXk9e3Jvb3RLZXl9XG4gICAgICAgICAgcmVmPXtyb290S2V5fVxuICAgICAgICAgIHJvb3ROb2RlPXtGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCkuZ2V0Um9vdE5vZGUocm9vdEtleSl9XG4gICAgICAgICAgcm9vdEtleT17cm9vdEtleX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlVHJlZTtcbiJdfQ==