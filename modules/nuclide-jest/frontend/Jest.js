/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {AggregatedResults, TestResult, AssertionResult} from '../types';

import React from 'react';

import {Icon} from 'nuclide-commons-ui/Icon';

type Props = {
  results: ?AggregatedResults,
};

export default class Jest extends React.Component<Props> {
  render() {
    const {results} = this.props;
    if (results == null) {
      return null;
    }

    const success = results.numFailedTests === 0;

    return (
      <Body>
        <Header success={success}>
          <HeaderLeft>{success ? 'Passed!' : 'Failed :('}</HeaderLeft>
          <div>
            {results.numPassedTests} of {results.numTotalTests} passed
          </div>
        </Header>
        <Main>
          <List>
            {results.testResults.map(result => (
              <ResultItem key={result.testFilePath} result={result} />
            ))}
          </List>
          <details style={{paddingLeft: 40}}>
            <summary>Raw Jest JSON Output (debug)</summary>
            <pre>{JSON.stringify(results, null, 2)}</pre>
          </details>
        </Main>
      </Body>
    );
  }
}

type ResultProps = {
  result: TestResult,
};
function ResultItem(props: ResultProps) {
  const {result} = props;
  return (
    <li>
      <span>{result.testFilePath}</span>
      {result.failureMessage == null ? null : (
        <pre>{result.failureMessage}</pre>
      )}
      <details open={!result.failureMessage}>
        <List>
          {result.testResults.map(test => (
            <SingleTestItem key={test.fullName} test={test} />
          ))}
        </List>
      </details>
    </li>
  );
}

type SingleTestProps = {
  test: AssertionResult,
};
function SingleTestItem(props: SingleTestProps) {
  const {test} = props;
  return (
    <li>
      <Icon icon={statusToIcon[test.status]} />
      <span>{test.title}</span>
      {test.failureMessages.length > 0 ? (
        <List>
          {test.failureMessages.map(message => {
            return (
              <li key={message}>
                <pre>{message}</pre>
              </li>
            );
          })}
        </List>
      ) : null}
    </li>
  );
}

function Body(props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}
      {...props}
    />
  );
}

function Header(props) {
  const {success, ...restProps} = props;
  return (
    <header
      style={{
        alignItems: 'center',
        display: 'flex',
        height: 48,
        backgroundColor: success ? 'green' : 'red',
        color: 'white',
        flex: '0 0 48',
        padding: 20,
      }}
      {...restProps}
    />
  );
}

const HeaderLeft = function(props) {
  return <div style={{flex: 1}} {...props} />;
};

const Main = function(props) {
  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        padding: '40px 0',
      }}
      {...props}
    />
  );
};

const List = function(props) {
  return (
    <ol
      style={{
        listStyle: 'none',
        paddingLeft: 40,
      }}
      {...props}
    />
  );
};

const statusToIcon = {
  passed: 'check',
  failed: 'x',
  pending: 'dash',
  skipped: 'dash',
};
