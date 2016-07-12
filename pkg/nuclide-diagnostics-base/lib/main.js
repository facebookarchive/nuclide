Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// TODO figure out how to allow the diagnostic consumer to poll (for example, if
// it was just activated and wants diagnostic messages without having to wait
// for an event to occur)

// Implicit invalidation semantics:
//
// - Previous 'file' scope messages are invalidated if and only if
// filePathToMessages contains their key as a path.
//
// - All previous 'project' scope messages are invalidated whenever
// projectMessages is populated.

var _DiagnosticStore2;

function _DiagnosticStore() {
  return _DiagnosticStore2 = _interopRequireDefault(require('./DiagnosticStore'));
}

/**
 * Linter APIs, for compatibility with the Atom linter package.
 */

module.exports = {
  DiagnosticStore: (_DiagnosticStore2 || _DiagnosticStore()).default
};

// All observables here will issue an initial value on subscribe.

// Sent only when the messages for a given file change. Consumers may use this to avoid
// unnecessary work if the file(s) they are interested in are not changed.

// Sent whenever any project message changes.

// Sent whenever any message changes, and includes all messages.

/*
 * Allows overriding of the LinterProvider name per message. Useful for when
 * a provider's messages come from multiple lint sources.
 */

/**
 * Extension: Allows a provider to include a display name that will be shown with its messages.
 */

/**
 * In the official Linter API, the providerName is just "name".
 */

/**
 * Extension: Intended for developers who want to provide both interfaces to cater towards people
 * who use only the `linter` package. This way you can provide both, but tell Nuclide to ignore
 * the `linter` provider so that duplicate results do not appear.
 */

/**
 * Extension: Overrides `grammarScopes` and triggers the linter on changes to any file, rather
 * than just files with specific grammar scopes.
 */