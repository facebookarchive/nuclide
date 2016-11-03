'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _string;

function _load_string() {
  return _string = require('../../commons-node/string');
}

/**
 * We choose a length that should be long enough to uniquely identify a ChangeSet with an Hg repo,
 * while also being compact enough to display efficiently in a UI.
 */
const CHANGE_SET_ID_PREFIX_LENGTH = 8;
const HG_BLAME_ERROR_MESSAGE_START = '[abort: ';

/**
 * Parses the output of `hg blame -r "wdir()" -T json --changeset --user --line-number <filename>`.
 * @return A Map that maps line numbers (0-indexed) to the blame info for the line.
 *   The blame info is of the form: "Firstname Lastname <username@email.com> ChangeSetID".
 *   (The Firstname Lastname may not appear sometimes.)
 *   The ChangeSetID will not be the full 40 digit hexadecimal number, but a prefix whose length is
 *   determined by CHANGE_SET_ID_PREFIX_LENGTH.
 */
function parseHgBlameOutput(output) {
  const results = new Map();

  if (output.startsWith(HG_BLAME_ERROR_MESSAGE_START)) {
    return results;
  }

  let arrayOfLineDescriptions;
  try {
    arrayOfLineDescriptions = JSON.parse(output);
  } catch (e) {
    // The error message may change. An error will return non-JSON.
    return results;
  }
  arrayOfLineDescriptions.forEach((lineDescription, index) => {
    let changeSetId = lineDescription.node;
    if (changeSetId != null) {
      changeSetId = changeSetId.substring(0, CHANGE_SET_ID_PREFIX_LENGTH);
    }
    results.set(index.toString(), `${ lineDescription.user } ${ (0, (_string || _load_string()).maybeToString)(changeSetId) }`);
  });

  return results;
}

module.exports = {
  parseHgBlameOutput: parseHgBlameOutput
};