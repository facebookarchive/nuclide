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

var PropTypes = _reactForAtom.React.PropTypes;

var FileTree = (function (_React$Component) {
  _inherits(FileTree, _React$Component);

  _createClass(FileTree, null, [{
    key: 'trackFirstRender',
    value: (0, _commons.once)(function (instance) {
      var rootKeysLength = instance.props.store.getRootKeys().length;
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
  }, {
    key: 'propTypes',
    value: {
      store: PropTypes.instanceOf(_libFileTreeStore2['default']).isRequired
    },
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

      this._subscriptions.add(this.props.store.subscribe(function () {
        var nodeToKeepInView = _this.props.store.getTrackedNode();
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
    key: 'focus',
    value: function focus() {
      _reactForAtom.React.findDOMNode(this).focus();
    }
  }, {
    key: 'hasFocus',
    value: function hasFocus() {
      return document.activeElement === _reactForAtom.React.findDOMNode(this);
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
      var _this2 = this;

      var rootKeys = this.props.store.getRootKeys();
      if (rootKeys.length === 0) {
        return _reactForAtom.React.createElement(_EmptyComponent2['default'], null);
      }
      return rootKeys.map(function (rootKey) {
        return _reactForAtom.React.createElement(_RootNodeComponent2['default'], {
          key: rootKey,
          ref: rootKey,
          rootNode: _this2.props.store.getRootNode(rootKey),
          rootKey: rootKey
        });
      });
    }
  }]);

  return FileTree;
})(_reactForAtom.React.Component);

module.exports = FileTree;
//# sourceMappingURL=data:application/json;base64,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O0FBQ3BELFVBQU0sUUFBdUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUMvRCxVQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3pCLGVBQU8sb0VBQWtCLENBQUM7T0FDM0I7QUFDRCxhQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQyxPQUFPLEVBQUs7QUFDL0IsZUFDRTtBQUNFLGFBQUcsRUFBRSxPQUFPLEFBQUM7QUFDYixhQUFHLEVBQUUsT0FBTyxBQUFDO0FBQ2Isa0JBQVEsRUFBRSxPQUFLLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxBQUFDO0FBQ2hELGlCQUFPLEVBQUUsT0FBTyxBQUFDO1VBQ2pCLENBQ0Y7T0FDSCxDQUFDLENBQUM7S0FDSjs7O1NBckdHLFFBQVE7R0FBUyxvQkFBTSxTQUFTOztBQXdHdEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMiLCJmaWxlIjoiRmlsZVRyZWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IEZpbGVUcmVlU3RvcmUgZnJvbSAnLi4vbGliL0ZpbGVUcmVlU3RvcmUnO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IFJvb3ROb2RlQ29tcG9uZW50IGZyb20gJy4vUm9vdE5vZGVDb21wb25lbnQnO1xuaW1wb3J0IEVtcHR5Q29tcG9uZW50IGZyb20gJy4vRW1wdHlDb21wb25lbnQnO1xuaW1wb3J0IHt0cmFja30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCB7b25jZX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmNsYXNzIEZpbGVUcmVlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgc3RhdGljIHRyYWNrRmlyc3RSZW5kZXIgPSBvbmNlKGluc3RhbmNlID0+IHtcbiAgICBjb25zdCByb290S2V5c0xlbmd0aCA9IGluc3RhbmNlLnByb3BzLnN0b3JlLmdldFJvb3RLZXlzKCkubGVuZ3RoO1xuICAgIC8vIFdhaXQgdXNpbmcgYHNldFRpbWVvdXRgIGFuZCBub3QgYHByb2Nlc3MubmV4dFRpY2tgIG9yIGBzZXRJbW1lZGlhdGVgXG4gICAgLy8gYmVjYXVzZSB0aG9zZSBxdWV1ZSB0YXNrcyBpbiB0aGUgY3VycmVudCBhbmQgbmV4dCB0dXJuIG9mIHRoZSBldmVudCBsb29wXG4gICAgLy8gcmVzcGVjdGl2ZWx5LiBTaW5jZSBgc2V0VGltZW91dGAgZ2V0cyBwcmVlbXB0ZWQgYnkgdGhlbSwgaXQgd29ya3MgZ3JlYXRcbiAgICAvLyBmb3IgYSBtb3JlIHJlYWxpc3RpYyBcImZpcnN0IHJlbmRlclwiLiBOb3RlOiBUaGUgc2NoZWR1bGVyIGZvciBwcm9taXNlc1xuICAgIC8vIChgUHJvbWlzZS5yZXNvbHZlKCkudGhlbmApIHJ1bnMgb24gdGhlIHNhbWUgcXVldWUgYXMgYHByb2Nlc3MubmV4dFRpY2tgXG4gICAgLy8gYnV0IHdpdGggYSBoaWdoZXIgcHJpb3JpdHkuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0cmFjaygnZmlsZXRyZWUtZmlyc3QtcmVuZGVyJywge1xuICAgICAgICAndGltZS10by1yZW5kZXInOiBTdHJpbmcocHJvY2Vzcy51cHRpbWUoKSAqIDEwMDApLFxuICAgICAgICAncm9vdC1rZXlzJzogU3RyaW5nKHJvb3RLZXlzTGVuZ3RoKSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIHN0b3JlOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihGaWxlVHJlZVN0b3JlKS5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIG5vZGVUb0tlZXBJblZpZXc6IG51bGwsXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgdGhpcy5wcm9wcy5zdG9yZS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICBjb25zdCBub2RlVG9LZWVwSW5WaWV3ID0gdGhpcy5wcm9wcy5zdG9yZS5nZXRUcmFja2VkTm9kZSgpO1xuICAgICAgICBpZiAobm9kZVRvS2VlcEluVmlldyAhPT0gdGhpcy5zdGF0ZS5ub2RlVG9LZWVwSW5WaWV3KSB7XG4gICAgICAgICAgLypcbiAgICAgICAgICAgKiBTdG9yZSBhIGNvcHkgb2YgYG5vZGVUb0tlZXBJblZpZXdgIHNvIHRoZSBTdG9yZSBjYW4gdXBkYXRlIGR1cmluZyB0aGlzIGNvbXBvbmVudCdzXG4gICAgICAgICAgICogcmVuZGVyaW5nIHdpdGhvdXQgd2lwaW5nIG91dCB0aGUgc3RhdGUgb2YgdGhlIG5vZGUgdGhhdCBuZWVkcyB0byBzY3JvbGwgaW50byB2aWV3LlxuICAgICAgICAgICAqIFN0b3JlIGV2ZW50cyBhcmUgZmlyZWQgc3luY2hyb25vdXNseSwgd2hpY2ggbWVhbnMgYGdldE5vZGVUb0tlZXBJblZpZXdgIHdpbGwgcmV0dXJuIGl0c1xuICAgICAgICAgICAqIHZhbHVlIGZvciBhdCBsZWFzdCBvbmUgYGNoYW5nZWAgZXZlbnQuXG4gICAgICAgICAgICovXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bm9kZVRvS2VlcEluVmlld30pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE5vdGU6IEl0J3Mgc2FmZSB0byBjYWxsIGZvcmNlVXBkYXRlIGhlcmUgYmVjYXVzZSB0aGUgY2hhbmdlIGV2ZW50cyBhcmUgZGUtYm91bmNlZC5cbiAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgKTtcbiAgICBGaWxlVHJlZS50cmFja0ZpcnN0UmVuZGVyKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogT2JqZWN0LCBwcmV2U3RhdGU6IE9iamVjdCk6IHZvaWQge1xuICAgIGlmIChwcmV2U3RhdGUubm9kZVRvS2VlcEluVmlldyAhPSBudWxsKSB7XG4gICAgICAvKlxuICAgICAgICogU2Nyb2xsIHRoZSBub2RlIGludG8gdmlldyBvbmUgZmluYWwgdGltZSBhZnRlciBiZWluZyByZXNldCB0byBlbnN1cmUgZmluYWwgcmVuZGVyIGlzXG4gICAgICAgKiBjb21wbGV0ZSBiZWZvcmUgc2Nyb2xsaW5nLiBCZWNhdXNlIHRoZSBub2RlIGlzIGluIGBwcmV2U3RhdGVgLCBjaGVjayBmb3IgaXRzIGV4aXN0ZW5jZVxuICAgICAgICogYmVmb3JlIHNjcm9sbGluZyBpdC5cbiAgICAgICAqL1xuICAgICAgY29uc3QgcmVmTm9kZSA9IHRoaXMucmVmc1twcmV2U3RhdGUubm9kZVRvS2VlcEluVmlldy5yb290S2V5XTtcbiAgICAgIGlmIChyZWZOb2RlICE9IG51bGwpIHtcbiAgICAgICAgcmVmTm9kZS5zY3JvbGxOb2RlSW50b1ZpZXdJZk5lZWRlZChwcmV2U3RhdGUubm9kZVRvS2VlcEluVmlldy5ub2RlS2V5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGZvY3VzKCk6IHZvaWQge1xuICAgIFJlYWN0LmZpbmRET01Ob2RlKHRoaXMpLmZvY3VzKCk7XG4gIH1cblxuICBoYXNGb2N1cygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gUmVhY3QuZmluZERPTU5vZGUodGhpcyk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWZpbGUtdHJlZSBmb2N1c2FibGUtcGFuZWwgdHJlZS12aWV3XCIgdGFiSW5kZXg9ezB9PlxuICAgICAgICB7dGhpcy5fcmVuZGVyQ2hpbGRyZW4oKX1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyQ2hpbGRyZW4oKTogUmVhY3RFbGVtZW50IHwgQXJyYXk8UmVhY3RFbGVtZW50PiB7XG4gICAgY29uc3Qgcm9vdEtleXM6IEFycmF5PHN0cmluZz4gPSB0aGlzLnByb3BzLnN0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgaWYgKHJvb3RLZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIDxFbXB0eUNvbXBvbmVudCAvPjtcbiAgICB9XG4gICAgcmV0dXJuIHJvb3RLZXlzLm1hcCgocm9vdEtleSkgPT4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFJvb3ROb2RlQ29tcG9uZW50XG4gICAgICAgICAga2V5PXtyb290S2V5fVxuICAgICAgICAgIHJlZj17cm9vdEtleX1cbiAgICAgICAgICByb290Tm9kZT17dGhpcy5wcm9wcy5zdG9yZS5nZXRSb290Tm9kZShyb290S2V5KX1cbiAgICAgICAgICByb290S2V5PXtyb290S2V5fVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVUcmVlO1xuIl19