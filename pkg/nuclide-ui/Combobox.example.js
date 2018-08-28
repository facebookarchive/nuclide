"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ComboboxExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _Block() {
  const data = require("../../modules/nuclide-commons-ui/Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _Combobox() {
  const data = require("./Combobox");

  _Combobox = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
function requestOptions() {
  return _RxMin.Observable.of(['Nuclide', 'Atom', 'Facebook']);
}

function onSelect(option) {// Handle select
}

function filterOptions(options, value) {
  // Custom filter to filter, sort, etc. how you want
  return options.filter(option => {
    const lowerCaseValue = value.toLowerCase();
    return option.toLowerCase().indexOf(lowerCaseValue) > -1;
  });
}

const BasicExample = () => React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement(_Combobox().Combobox, {
  initialTextInput: "",
  size: "sm",
  maxOptionCount: 30,
  requestOptions: requestOptions,
  placeholderText: "Search here",
  onSelect: onSelect,
  filterOptions: filterOptions
})));

const ComboboxExamples = {
  sectionName: 'Combobox',
  description: 'Combobox is a typeahead that supports async requests',
  examples: [{
    title: 'Basic Example',
    component: BasicExample
  }]
};
exports.ComboboxExamples = ComboboxExamples;