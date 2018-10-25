"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ListviewExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _Block() {
  const data = require("./Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _ListView() {
  const data = require("./ListView");

  _ListView = function () {
    return data;
  };

  return data;
}

function _Checkbox() {
  const data = require("./Checkbox");

  _Checkbox = function () {
    return data;
  };

  return data;
}

function _MultiSelectList() {
  const data = require("./MultiSelectList");

  _MultiSelectList = function () {
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
const NOOP = () => {};

const ListviewExample1 = () => React.createElement(_Block().Block, null, React.createElement(_ListView().ListView, {
  alternateBackground: true
}, React.createElement(_ListView().ListViewItem, {
  value: {
    id: 1
  }
}, "test1"), React.createElement(_ListView().ListViewItem, {
  value: {
    id: 2
  }
}, "test2"), React.createElement(_ListView().ListViewItem, {
  value: {
    id: 3
  }
}, "test3"), React.createElement(_ListView().ListViewItem, {
  value: {
    id: 4
  }
}, "test4"), React.createElement(_ListView().ListViewItem, {
  value: {
    id: 5
  }
}, "test5")));

const ListviewExample2 = () => React.createElement(_Block().Block, null, React.createElement(_ListView().ListView, {
  alternateBackground: true
}, React.createElement(_ListView().ListViewItem, null, React.createElement(_Checkbox().Checkbox, {
  checked: true,
  onClick: NOOP,
  onChange: NOOP,
  label: "A Checkbox."
})), React.createElement(_ListView().ListViewItem, null, React.createElement(_Checkbox().Checkbox, {
  checked: true,
  onClick: NOOP,
  onChange: NOOP,
  label: "A Checkbox."
})), React.createElement(_ListView().ListViewItem, null, React.createElement(_Checkbox().Checkbox, {
  checked: true,
  onClick: NOOP,
  onChange: NOOP,
  label: "A Checkbox."
})), React.createElement(_ListView().ListViewItem, null, React.createElement(_Checkbox().Checkbox, {
  checked: false,
  onClick: NOOP,
  onChange: NOOP,
  label: "A Checkbox."
})), React.createElement(_ListView().ListViewItem, null, React.createElement(_Checkbox().Checkbox, {
  checked: false,
  onClick: NOOP,
  onChange: NOOP,
  label: "A Checkbox."
}))));

class MultiSelectListExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: [2]
    };
  }

  render() {
    const options = [{
      value: 1,
      label: 'One'
    }, {
      value: 2,
      label: 'Two'
    }, {
      value: 3,
      label: 'Three'
    }, {
      value: 4,
      label: 'Four'
    }];
    return (// $FlowFixMe(>=0.53.0) Flow suppress
      React.createElement(_MultiSelectList().MultiSelectList, {
        options: options,
        value: this.state.value,
        onChange: value => {
          this.setState({
            value
          });
        }
      })
    );
  }

}

const ListviewExamples = {
  sectionName: 'ListView',
  description: '',
  examples: [{
    title: 'Simple ListView',
    component: ListviewExample1
  }, {
    title: 'Arbitrary components as list items',
    component: ListviewExample2
  }, {
    title: 'Multi-Select List',
    component: MultiSelectListExample
  }]
};
exports.ListviewExamples = ListviewExamples;