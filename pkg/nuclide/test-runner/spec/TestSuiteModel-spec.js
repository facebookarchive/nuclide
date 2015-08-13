'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var TestSuiteModel = require('../lib/TestSuiteModel');

describe('TestSuiteModel', () => {

  var testClassSummaries = [
    {id: 1, fileName: 'foo', className: 'foo', name: 'foo'},
    {id: 2, fileName: 'bar', className: 'bar', name: 'bar'},
  ];
  var testRun = {
    numAssertions: 1,
    numFailures: 0,
    numSkipped: 0,
    test_json: testClassSummaries[0],
  };

  it('maps test class IDs from a Array<TestClassSummary>', () => {
    var model = new TestSuiteModel(testClassSummaries);
    var testClassSummary = testClassSummaries[0];
    expect(model.testClasses.get(testClassSummary['id'])).toBe(testClassSummary);
  });

  it('calculates progress percent', () => {
    var model = new TestSuiteModel(testClassSummaries);
    model.addTestRun(testRun);
    expect(model.progressPercent()).toBe(50);
  });

});
