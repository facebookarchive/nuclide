Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _Block2;

function _Block() {
  return _Block2 = require('./Block');
}

var _Table2;

function _Table() {
  return _Table2 = require('./Table');
}

var Highlight42Component = function Highlight42Component(props) {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    { style: props.data === 42 ? { fontWeight: 'bold' } : {} },
    props.data
  );
};

var TableExample = function TableExample() {
  var columns = [{
    title: 'first column',
    key: 'first'
  }, {
    title: 'second column',
    key: 'second',
    component: Highlight42Component
  }, {
    title: 'third column',
    key: 'third'
  }, {
    title: 'fourth column',
    key: 'fourth'
  }, {
    title: 'fifth column',
    key: 'fifth'
  }];
  var rows = [{
    data: {
      first: 1,
      second: 2,
      third: 3,
      fourth: 33,
      fifth: 123
    }
  }, {
    className: 'this-is-an-optional-classname',
    data: {
      first: 4,
      second: 42,
      third: 6,
      fourth: 66,
      fifth: 123
    }
  }, {
    data: {
      first: 7,
      second: 42,
      // third is empty
      fourth: 66,
      fifth: 123
    }
  }];
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    (_Block2 || _Block()).Block,
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement((_Table2 || _Table()).Table, {
      columns: columns,
      rows: rows,
      selectable: true
    })
  );
};

var SortableTableExample = (function (_React$Component) {
  _inherits(SortableTableExample, _React$Component);

  function SortableTableExample(props) {
    _classCallCheck(this, SortableTableExample);

    _get(Object.getPrototypeOf(SortableTableExample.prototype), 'constructor', this).call(this, props);
    var rows = [{
      data: {
        first: 1,
        second: 3,
        third: 300
      }
    }, {
      data: {
        first: 2,
        second: 5,
        third: 200
      }
    }, {
      className: 'nuclide-ui-custom-classname-example',
      data: {
        first: 3,
        second: 4,
        third: 100
      }
    }];
    this.state = {
      sortDescending: false,
      sortedColumn: null,
      rows: rows
    };
    this._handleSort = this._handleSort.bind(this);
  }

  _createClass(SortableTableExample, [{
    key: '_handleSort',
    value: function _handleSort(sortedColumn, sortDescending) {
      var sortedRows = this.state.rows.sort(function (obj1, obj2) {
        var order = sortDescending ? -1 : 1;
        return order * (obj1.data[sortedColumn] - obj2.data[sortedColumn]);
      });
      this.setState({
        rows: sortedRows,
        sortedColumn: sortedColumn,
        sortDescending: sortDescending
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var columns = [{
        title: 'first',
        key: 'first'
      }, {
        title: 'second',
        key: 'second'
      }, {
        title: 'third',
        key: 'third'
      }];
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_Block2 || _Block()).Block,
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement((_Table2 || _Table()).Table, {
          emptyComponent: function () {
            return (_reactForAtom2 || _reactForAtom()).React.createElement(
              'div',
              null,
              'An optional, custom "empty message" component.'
            );
          },
          columns: columns,
          rows: this.state.rows,
          sortable: true,
          onSort: this._handleSort,
          sortedColumn: this.state.sortedColumn,
          sortDescending: this.state.sortDescending
        })
      );
    }
  }]);

  return SortableTableExample;
})((_reactForAtom2 || _reactForAtom()).React.Component);

var EmptyTableExample = function EmptyTableExample() {
  var columns = [{
    title: 'first column',
    key: 'first'
  }, {
    title: 'second column',
    key: 'second'
  }, {
    title: 'third column',
    key: 'third'
  }];
  var rows = [];
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    (_Block2 || _Block()).Block,
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement((_Table2 || _Table()).Table, {
      columns: columns,
      rows: rows
    })
  );
};

var TableExamples = {
  sectionName: 'Table',
  description: '',
  examples: [{
    title: 'Simple Table',
    component: TableExample
  }, {
    title: 'Sortable Table',
    component: SortableTableExample
  }, {
    title: 'Empty Table',
    component: EmptyTableExample
  }]
};
exports.TableExamples = TableExamples;