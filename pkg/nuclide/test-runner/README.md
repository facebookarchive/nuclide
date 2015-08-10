# Test Runner

A panel for running tests provided by test runner service packages

### Writing and registering a test runner

Test runners asynchronously run tests remotely or locally and emit events when tests are run.

#### Provide a test runner

Test runner implementations should implement the interface found in
"[./example/TestRunnerInterface.js](./examples/TestRunnerInterface.js)".
They do not need to actually extend that class, only match its methods.

**main.js:**

```javascript
module.exports = {
  provideTestRunner() {
    return {
      getByUri(uri: string): TestRunnerInterface {
        // Return the runner that will do the work for the given URI. Objects returned by this
        // function should implement the interface in example/TestRunnerInterface.js but do not need
        // to actually extend that class.
        return new TestRunnerImpl(uri);
      },
      // Used to identify this runner in the testing panel to allow users to select the correct
      // runner for a given test.
      label: 'My Little Test Runner',
    }
  },
};
```

**package.json:**

```json
{
  "//": "Expose the test provider via 'nuclide-test-runner.provider'",
  "providedServices": {
    "nuclide-test-runner.provider": {
      "versions": {
        "0.0.0": "provideTestRunner"
      }
    }
  }
}
```

#### Testing lifecycle

1. `run` is called on a test runner
2. Test runner calls `onDidStart`
3. Test runner calls any or none of its output methods:
  * `onDidRunSummary` (max: 1 time) prior to running tests with an overview of the test classes it
    will run
  * `onDidRunTest` (max: none) after a test is run with an object describing the test
  * `onStdoutData` (max: none) with unstructured stdout data that does not fit in `onDidRunTest`
  * `onStderrData` (max: none) with unstructured stderr data
  * `onError` (max: 1 time) when an unrecoverable error occurs; further output is ignored
4. Test runner calls `onDidEnd`
