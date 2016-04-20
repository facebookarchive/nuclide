var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('react-for-atom');

var React = _require.React;

var _require2 = require('../../../nuclide-ui/lib/PanelComponentScroller');

var PanelComponentScroller = _require2.PanelComponentScroller;

var TestClassTreeNode = require('./TestClassTreeNode');

var _require3 = require('../../../nuclide-ui/lib/TreeRootComponent');

var TreeRootComponent = _require3.TreeRootComponent;
var PropTypes = React.PropTypes;

function labelClassNameForNode() {
  return 'icon icon-code';
}

var TestClassTree = (function (_React$Component) {
  _inherits(TestClassTree, _React$Component);

  function TestClassTree() {
    _classCallCheck(this, TestClassTree);

    _get(Object.getPrototypeOf(TestClassTree.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(TestClassTree, [{
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      if (this.props.testSuiteModel !== prevProps.testSuiteModel) {
        var roots = [];
        if (this.props.testSuiteModel) {
          for (var testClass of this.props.testSuiteModel.testClasses.values()) {
            roots.push(new TestClassTreeNode(testClass));
          }
        }
        this.refs['tree'].setRoots(roots);
      }

      this.rowClassNameForNode = this.rowClassNameForNode.bind(this);
    }
  }, {
    key: 'render',
    value: function render() {
      var emptyRenderMessage = React.createElement(
        'div',
        null,
        React.createElement(
          'h5',
          null,
          'Running tests'
        ),
        React.createElement(
          'ol',
          null,
          React.createElement(
            'li',
            null,
            'Open the file you want to test'
          ),
          React.createElement(
            'li',
            null,
            'Choose the appropriate runner from the dropdown'
          ),
          React.createElement(
            'li',
            null,
            'Click "Test" to run tests for that file\'s directory'
          )
        )
      );

      return React.createElement(
        PanelComponentScroller,
        null,
        React.createElement(
          'div',
          { className: 'padded' },
          React.createElement(TreeRootComponent, {
            elementToRenderWhenEmpty: emptyRenderMessage,
            eventHandlerSelector: '.nuclide-test-runner-tree',
            initialRoots: [],
            labelClassNameForNode: labelClassNameForNode,
            onKeepSelection: function () {},
            ref: 'tree',
            rowClassNameForNode: this.rowClassNameForNode
          })
        )
      );
    }
  }, {
    key: 'rowClassNameForNode',
    value: function rowClassNameForNode(node) {
      if (!this.props.testSuiteModel) {
        return;
      }

      var item = node.getItem();
      var testRun = this.props.testSuiteModel.testRuns.get(item['id']);
      if (testRun) {
        if (testRun['numFailures'] > 0) {
          // Red/error if the test class had errors.
          return 'status-removed';
        } else if (testRun['numSkipped'] > 0) {
          // Yellow/warning if the class skipped tests.
          return 'status-modified';
        } else {
          // Green/success if all tests passed without skipping any.
          return 'status-added';
        }
      } else if (!this.props.isRunning) {
        return 'status-ignored';
      }
    }
  }], [{
    key: 'propTypes',
    value: {
      isRunning: PropTypes.bool.isRequired,
      testSuiteModel: PropTypes.object
    },
    enumerable: true
  }]);

  return TestClassTree;
})(React.Component);

module.exports = TestClassTree;
//# sourceMappingURL=data:application/json;base64,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LE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFO0FBQ2hDLGVBQU8sZ0JBQWdCLENBQUM7T0FDekI7S0FDRjs7O1dBckVrQjtBQUNqQixlQUFTLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FBQ3BDLG9CQUFjLEVBQUUsU0FBUyxDQUFDLE1BQU07S0FDakM7Ozs7U0FKRyxhQUFhO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBeUUzQyxNQUFNLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQyIsImZpbGUiOiJUZXN0Q2xhc3NUcmVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0xhenlUcmVlTm9kZX0gZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS11aS9saWIvTGF6eVRyZWVOb2RlJztcblxuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7UGFuZWxDb21wb25lbnRTY3JvbGxlcn0gPSByZXF1aXJlKCcuLi8uLi8uLi9udWNsaWRlLXVpL2xpYi9QYW5lbENvbXBvbmVudFNjcm9sbGVyJyk7XG5jb25zdCBUZXN0Q2xhc3NUcmVlTm9kZSA9IHJlcXVpcmUoJy4vVGVzdENsYXNzVHJlZU5vZGUnKTtcbmNvbnN0IHtUcmVlUm9vdENvbXBvbmVudH0gPSByZXF1aXJlKCcuLi8uLi8uLi9udWNsaWRlLXVpL2xpYi9UcmVlUm9vdENvbXBvbmVudCcpO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5mdW5jdGlvbiBsYWJlbENsYXNzTmFtZUZvck5vZGUoKTogc3RyaW5nIHtcbiAgcmV0dXJuICdpY29uIGljb24tY29kZSc7XG59XG5cbmNsYXNzIFRlc3RDbGFzc1RyZWUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGlzUnVubmluZzogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICB0ZXN0U3VpdGVNb2RlbDogUHJvcFR5cGVzLm9iamVjdCxcbiAgfTtcblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBPYmplY3QpIHtcbiAgICBpZiAodGhpcy5wcm9wcy50ZXN0U3VpdGVNb2RlbCAhPT0gcHJldlByb3BzLnRlc3RTdWl0ZU1vZGVsKSB7XG4gICAgICBjb25zdCByb290cyA9IFtdO1xuICAgICAgaWYgKHRoaXMucHJvcHMudGVzdFN1aXRlTW9kZWwpIHtcbiAgICAgICAgZm9yIChjb25zdCB0ZXN0Q2xhc3Mgb2YgdGhpcy5wcm9wcy50ZXN0U3VpdGVNb2RlbC50ZXN0Q2xhc3Nlcy52YWx1ZXMoKSkge1xuICAgICAgICAgIHJvb3RzLnB1c2gobmV3IFRlc3RDbGFzc1RyZWVOb2RlKHRlc3RDbGFzcykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLnJlZnNbJ3RyZWUnXS5zZXRSb290cyhyb290cyk7XG4gICAgfVxuXG4gICAgKHRoaXM6IGFueSkucm93Q2xhc3NOYW1lRm9yTm9kZSA9IHRoaXMucm93Q2xhc3NOYW1lRm9yTm9kZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IGVtcHR5UmVuZGVyTWVzc2FnZSA9IChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxoNT5SdW5uaW5nIHRlc3RzPC9oNT5cbiAgICAgICAgPG9sPlxuICAgICAgICAgIDxsaT5PcGVuIHRoZSBmaWxlIHlvdSB3YW50IHRvIHRlc3Q8L2xpPlxuICAgICAgICAgIDxsaT5DaG9vc2UgdGhlIGFwcHJvcHJpYXRlIHJ1bm5lciBmcm9tIHRoZSBkcm9wZG93bjwvbGk+XG4gICAgICAgICAgPGxpPnsnQ2xpY2sgXCJUZXN0XCIgdG8gcnVuIHRlc3RzIGZvciB0aGF0IGZpbGVcXCdzIGRpcmVjdG9yeSd9PC9saT5cbiAgICAgICAgPC9vbD5cbiAgICAgIDwvZGl2PlxuICAgICk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPFBhbmVsQ29tcG9uZW50U2Nyb2xsZXI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFkZGVkXCI+XG4gICAgICAgICAgPFRyZWVSb290Q29tcG9uZW50XG4gICAgICAgICAgICBlbGVtZW50VG9SZW5kZXJXaGVuRW1wdHk9e2VtcHR5UmVuZGVyTWVzc2FnZX1cbiAgICAgICAgICAgIGV2ZW50SGFuZGxlclNlbGVjdG9yPVwiLm51Y2xpZGUtdGVzdC1ydW5uZXItdHJlZVwiXG4gICAgICAgICAgICBpbml0aWFsUm9vdHM9e1tdfVxuICAgICAgICAgICAgbGFiZWxDbGFzc05hbWVGb3JOb2RlPXtsYWJlbENsYXNzTmFtZUZvck5vZGV9XG4gICAgICAgICAgICBvbktlZXBTZWxlY3Rpb249eygpID0+IHt9fVxuICAgICAgICAgICAgcmVmPVwidHJlZVwiXG4gICAgICAgICAgICByb3dDbGFzc05hbWVGb3JOb2RlPXt0aGlzLnJvd0NsYXNzTmFtZUZvck5vZGV9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L1BhbmVsQ29tcG9uZW50U2Nyb2xsZXI+XG4gICAgKTtcbiAgfVxuXG4gIHJvd0NsYXNzTmFtZUZvck5vZGUobm9kZTogTGF6eVRyZWVOb2RlKTogP3N0cmluZyB7XG4gICAgaWYgKCF0aGlzLnByb3BzLnRlc3RTdWl0ZU1vZGVsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaXRlbSA9IG5vZGUuZ2V0SXRlbSgpO1xuICAgIGNvbnN0IHRlc3RSdW4gPSB0aGlzLnByb3BzLnRlc3RTdWl0ZU1vZGVsLnRlc3RSdW5zLmdldChpdGVtWydpZCddKTtcbiAgICBpZiAodGVzdFJ1bikge1xuICAgICAgaWYgKHRlc3RSdW5bJ251bUZhaWx1cmVzJ10gPiAwKSB7XG4gICAgICAgIC8vIFJlZC9lcnJvciBpZiB0aGUgdGVzdCBjbGFzcyBoYWQgZXJyb3JzLlxuICAgICAgICByZXR1cm4gJ3N0YXR1cy1yZW1vdmVkJztcbiAgICAgIH0gZWxzZSBpZiAodGVzdFJ1blsnbnVtU2tpcHBlZCddID4gMCkge1xuICAgICAgICAvLyBZZWxsb3cvd2FybmluZyBpZiB0aGUgY2xhc3Mgc2tpcHBlZCB0ZXN0cy5cbiAgICAgICAgcmV0dXJuICdzdGF0dXMtbW9kaWZpZWQnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gR3JlZW4vc3VjY2VzcyBpZiBhbGwgdGVzdHMgcGFzc2VkIHdpdGhvdXQgc2tpcHBpbmcgYW55LlxuICAgICAgICByZXR1cm4gJ3N0YXR1cy1hZGRlZCc7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghdGhpcy5wcm9wcy5pc1J1bm5pbmcpIHtcbiAgICAgIHJldHVybiAnc3RhdHVzLWlnbm9yZWQnO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlc3RDbGFzc1RyZWU7XG4iXX0=