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
//# sourceMappingURL=data:application/json;base64,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QyxXQUFXLENBQUMsT0FBTyxDQUFDLEFBQUM7QUFDM0QsaUJBQU8sRUFBRSxPQUFPLEFBQUM7VUFDakIsQ0FDRjtPQUNILENBQUMsQ0FBQztLQUNKOzs7U0ExRkcsUUFBUTtHQUFTLG9CQUFNLFNBQVM7O0FBNkZ0QyxNQUFNLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyIsImZpbGUiOiJGaWxlVHJlZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtGaWxlVHJlZU5vZGVEYXRhfSBmcm9tICcuLi9saWIvRmlsZVRyZWVTdG9yZSc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgRmlsZVRyZWVTdG9yZSBmcm9tICcuLi9saWIvRmlsZVRyZWVTdG9yZSc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgUm9vdE5vZGVDb21wb25lbnQgZnJvbSAnLi9Sb290Tm9kZUNvbXBvbmVudCc7XG5pbXBvcnQgRW1wdHlDb21wb25lbnQgZnJvbSAnLi9FbXB0eUNvbXBvbmVudCc7XG5pbXBvcnQge3RyYWNrfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IHtvbmNlfSBmcm9tICcuLi8uLi9jb21tb25zJztcblxudHlwZSBTdGF0ZSA9IHtcbiAgbm9kZVRvS2VlcEluVmlldzogP0ZpbGVUcmVlTm9kZURhdGE7XG59O1xuXG5jbGFzcyBGaWxlVHJlZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx2b2lkLCB2b2lkLCBTdGF0ZT4ge1xuICBzdGF0ZTogU3RhdGU7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIHN0YXRpYyB0cmFja0ZpcnN0UmVuZGVyID0gb25jZSgoKSA9PiB7XG4gICAgY29uc3Qgcm9vdEtleXNMZW5ndGggPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCkuZ2V0Um9vdEtleXMoKS5sZW5ndGg7XG4gICAgLy8gV2FpdCB1c2luZyBgc2V0VGltZW91dGAgYW5kIG5vdCBgcHJvY2Vzcy5uZXh0VGlja2Agb3IgYHNldEltbWVkaWF0ZWBcbiAgICAvLyBiZWNhdXNlIHRob3NlIHF1ZXVlIHRhc2tzIGluIHRoZSBjdXJyZW50IGFuZCBuZXh0IHR1cm4gb2YgdGhlIGV2ZW50IGxvb3BcbiAgICAvLyByZXNwZWN0aXZlbHkuIFNpbmNlIGBzZXRUaW1lb3V0YCBnZXRzIHByZWVtcHRlZCBieSB0aGVtLCBpdCB3b3JrcyBncmVhdFxuICAgIC8vIGZvciBhIG1vcmUgcmVhbGlzdGljIFwiZmlyc3QgcmVuZGVyXCIuIE5vdGU6IFRoZSBzY2hlZHVsZXIgZm9yIHByb21pc2VzXG4gICAgLy8gKGBQcm9taXNlLnJlc29sdmUoKS50aGVuYCkgcnVucyBvbiB0aGUgc2FtZSBxdWV1ZSBhcyBgcHJvY2Vzcy5uZXh0VGlja2BcbiAgICAvLyBidXQgd2l0aCBhIGhpZ2hlciBwcmlvcml0eS5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRyYWNrKCdmaWxldHJlZS1maXJzdC1yZW5kZXInLCB7XG4gICAgICAgICd0aW1lLXRvLXJlbmRlcic6IFN0cmluZyhwcm9jZXNzLnVwdGltZSgpICogMTAwMCksXG4gICAgICAgICdyb290LWtleXMnOiBTdHJpbmcocm9vdEtleXNMZW5ndGgpLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiB2b2lkKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBub2RlVG9LZWVwSW5WaWV3OiBudWxsLFxuICAgIH07XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICBjb25zdCBub2RlVG9LZWVwSW5WaWV3ID0gRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpLmdldFRyYWNrZWROb2RlKCk7XG4gICAgICAgIGlmIChub2RlVG9LZWVwSW5WaWV3ICE9PSB0aGlzLnN0YXRlLm5vZGVUb0tlZXBJblZpZXcpIHtcbiAgICAgICAgICAvKlxuICAgICAgICAgICAqIFN0b3JlIGEgY29weSBvZiBgbm9kZVRvS2VlcEluVmlld2Agc28gdGhlIFN0b3JlIGNhbiB1cGRhdGUgZHVyaW5nIHRoaXMgY29tcG9uZW50J3NcbiAgICAgICAgICAgKiByZW5kZXJpbmcgd2l0aG91dCB3aXBpbmcgb3V0IHRoZSBzdGF0ZSBvZiB0aGUgbm9kZSB0aGF0IG5lZWRzIHRvIHNjcm9sbCBpbnRvIHZpZXcuXG4gICAgICAgICAgICogU3RvcmUgZXZlbnRzIGFyZSBmaXJlZCBzeW5jaHJvbm91c2x5LCB3aGljaCBtZWFucyBgZ2V0Tm9kZVRvS2VlcEluVmlld2Agd2lsbCByZXR1cm4gaXRzXG4gICAgICAgICAgICogdmFsdWUgZm9yIGF0IGxlYXN0IG9uZSBgY2hhbmdlYCBldmVudC5cbiAgICAgICAgICAgKi9cbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtub2RlVG9LZWVwSW5WaWV3fSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTm90ZTogSXQncyBzYWZlIHRvIGNhbGwgZm9yY2VVcGRhdGUgaGVyZSBiZWNhdXNlIHRoZSBjaGFuZ2UgZXZlbnRzIGFyZSBkZS1ib3VuY2VkLlxuICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICApO1xuICAgIEZpbGVUcmVlLnRyYWNrRmlyc3RSZW5kZXIodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiB2b2lkLCBwcmV2U3RhdGU6IE9iamVjdCk6IHZvaWQge1xuICAgIGlmIChwcmV2U3RhdGUubm9kZVRvS2VlcEluVmlldyAhPSBudWxsKSB7XG4gICAgICAvKlxuICAgICAgICogU2Nyb2xsIHRoZSBub2RlIGludG8gdmlldyBvbmUgZmluYWwgdGltZSBhZnRlciBiZWluZyByZXNldCB0byBlbnN1cmUgZmluYWwgcmVuZGVyIGlzXG4gICAgICAgKiBjb21wbGV0ZSBiZWZvcmUgc2Nyb2xsaW5nLiBCZWNhdXNlIHRoZSBub2RlIGlzIGluIGBwcmV2U3RhdGVgLCBjaGVjayBmb3IgaXRzIGV4aXN0ZW5jZVxuICAgICAgICogYmVmb3JlIHNjcm9sbGluZyBpdC5cbiAgICAgICAqL1xuICAgICAgY29uc3QgcmVmTm9kZSA9IHRoaXMucmVmc1twcmV2U3RhdGUubm9kZVRvS2VlcEluVmlldy5yb290S2V5XTtcbiAgICAgIGlmIChyZWZOb2RlICE9IG51bGwpIHtcbiAgICAgICAgcmVmTm9kZS5zY3JvbGxOb2RlSW50b1ZpZXdJZk5lZWRlZChwcmV2U3RhdGUubm9kZVRvS2VlcEluVmlldy5ub2RlS2V5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZmlsZS10cmVlIGZvY3VzYWJsZS1wYW5lbCB0cmVlLXZpZXdcIiB0YWJJbmRleD17MH0+XG4gICAgICAgIHt0aGlzLl9yZW5kZXJDaGlsZHJlbigpfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9yZW5kZXJDaGlsZHJlbigpOiBSZWFjdEVsZW1lbnQgfCBBcnJheTxSZWFjdEVsZW1lbnQ+IHtcbiAgICBjb25zdCByb290S2V5czogQXJyYXk8c3RyaW5nPiA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKS5nZXRSb290S2V5cygpO1xuICAgIGlmIChyb290S2V5cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiA8RW1wdHlDb21wb25lbnQgLz47XG4gICAgfVxuICAgIHJldHVybiByb290S2V5cy5tYXAocm9vdEtleSA9PiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8Um9vdE5vZGVDb21wb25lbnRcbiAgICAgICAgICBrZXk9e3Jvb3RLZXl9XG4gICAgICAgICAgcmVmPXtyb290S2V5fVxuICAgICAgICAgIHJvb3ROb2RlPXtGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCkuZ2V0Um9vdE5vZGUocm9vdEtleSl9XG4gICAgICAgICAgcm9vdEtleT17cm9vdEtleX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlVHJlZTtcbiJdfQ==