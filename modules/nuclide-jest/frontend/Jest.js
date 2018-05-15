'use strict';Object.defineProperty(exports, "__esModule", { value: true });













var _react = _interopRequireDefault(require('react'));var _Icon;

function _load_Icon() {return _Icon = require('../../nuclide-commons-ui/Icon');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _objectWithoutProperties(obj, keys) {var target = {};for (var i in obj) {if (keys.indexOf(i) >= 0) continue;if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;target[i] = obj[i];}return target;} /**
                                                                                                                                                                                                                                                                                                                                                                                                   * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                   * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                                                                                                                                                   * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                   * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                   * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                                                                                                                                                   *  strict-local
                                                                                                                                                                                                                                                                                                                                                                                                   * @format
                                                                                                                                                                                                                                                                                                                                                                                                   */class Jest extends _react.default.Component {render() {const { results } = this.props;if (results == null) {return null;
    }

    const success = results.numFailedTests === 0;

    return (
      _react.default.createElement(Body, null,
        _react.default.createElement(Header, { success: success },
          _react.default.createElement(HeaderLeft, null, success ? 'Passed!' : 'Failed :('),
          _react.default.createElement('div', null,
            results.numPassedTests, ' of ', results.numTotalTests, ' passed')),


        _react.default.createElement(Main, null,
          _react.default.createElement(List, null,
            results.testResults.map(result =>
            _react.default.createElement(ResultItem, { key: result.testFilePath, result: result }))),


          _react.default.createElement('details', { style: { paddingLeft: 40 } },
            _react.default.createElement('summary', null, 'Raw Jest JSON Output (debug)'),
            _react.default.createElement('pre', null, JSON.stringify(results, null, 2))))));




  }}exports.default = Jest;





function ResultItem(props) {
  const { result } = props;
  return (
    _react.default.createElement('li', null,
      _react.default.createElement('span', null, result.testFilePath),
      result.failureMessage == null ? null :
      _react.default.createElement('pre', null, result.failureMessage),

      _react.default.createElement('details', { open: !result.failureMessage },
        _react.default.createElement(List, null,
          result.testResults.map(test =>
          _react.default.createElement(SingleTestItem, { key: test.fullName, test: test }))))));





}




function SingleTestItem(props) {
  const { test } = props;
  return (
    _react.default.createElement('li', null,
      _react.default.createElement((_Icon || _load_Icon()).Icon, { icon: statusToIcon[test.status] }),
      _react.default.createElement('span', null, test.title),
      test.failureMessages.length > 0 ?
      _react.default.createElement(List, null,
        test.failureMessages.map(message => {
          return (
            _react.default.createElement('li', { key: message },
              _react.default.createElement('pre', null, message)));


        })) :

      null));


}

function Body(props) {
  return (
    _react.default.createElement('div', Object.assign({
      style: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh' } },

    props)));


}

function Header(props) {
  const { success } = props,restProps = _objectWithoutProperties(props, ['success']);
  return (
    _react.default.createElement('header', Object.assign({
      style: {
        alignItems: 'center',
        display: 'flex',
        height: 48,
        backgroundColor: success ? 'green' : 'red',
        color: 'white',
        flex: '0 0 48',
        padding: 20 } },

    restProps)));


}

const HeaderLeft = function (props) {
  return _react.default.createElement('div', Object.assign({ style: { flex: 1 } }, props));
};

const Main = function (props) {
  return (
    _react.default.createElement('div', Object.assign({
      style: {
        flex: 1,
        overflow: 'auto',
        padding: '40px 0' } },

    props)));


};

const List = function (props) {
  return (
    _react.default.createElement('ol', Object.assign({
      style: {
        listStyle: 'none',
        paddingLeft: 40 } },

    props)));


};

const statusToIcon = {
  passed: 'check',
  failed: 'x',
  pending: 'dash',
  skipped: 'dash' };