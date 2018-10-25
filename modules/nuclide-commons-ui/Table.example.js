"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TableExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _Block() {
  const data = require("./Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _Table() {
  const data = require("./Table");

  _Table = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
const Highlight42Component = props => React.createElement("div", {
  style: props.data === 42 ? {
    fontWeight: 'bold'
  } : {}
}, props.data);

const TableExample = () => {
  const columns = [{
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
  const rows = [{
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
      third: undefined,
      fourth: 66,
      fifth: 123
    }
  }];
  return React.createElement(_Block().Block, null, React.createElement(_Table().Table, {
    columns: columns,
    rows: rows,
    selectable: true
  }));
};

class SortableTableExample extends React.Component {
  constructor(props) {
    super(props);
    const rows = [{
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
      rows
    };
    this._handleSort = this._handleSort.bind(this);
  }

  _handleSort(sortedColumn, sortDescending) {
    // TODO: (wbinnssmith) T30771435 this setState depends on current state
    // and should use an updater function rather than an object
    // eslint-disable-next-line react/no-access-state-in-setstate
    const sortedRows = this.state.rows.sort((obj1, obj2) => {
      const order = sortDescending ? -1 : 1;
      return order * (obj1.data[sortedColumn] - obj2.data[sortedColumn]);
    });
    this.setState({
      rows: sortedRows,
      sortedColumn,
      sortDescending
    });
  }

  render() {
    const columns = [{
      title: 'first',
      key: 'first'
    }, {
      title: 'second',
      key: 'second'
    }, {
      title: 'third',
      key: 'third'
    }];
    return React.createElement(_Block().Block, null, React.createElement(_Table().Table, {
      emptyComponent: () => React.createElement("div", null, "An optional, custom \"empty message\" component."),
      columns: columns,
      rows: this.state.rows,
      sortable: true,
      onSort: this._handleSort,
      sortedColumn: this.state.sortedColumn,
      sortDescending: this.state.sortDescending
    }));
  }

}

const EmptyTableExample = () => {
  const columns = [{
    title: 'first column',
    key: 'first'
  }, {
    title: 'second column',
    key: 'second'
  }, {
    title: 'third column',
    key: 'third'
  }];
  const rows = [];
  return React.createElement(_Block().Block, null, React.createElement(_Table().Table, {
    columns: columns,
    rows: rows
  }));
};

const TableExamples = {
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