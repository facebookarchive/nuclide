

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function capitalize(word) {
  if (word.length === 0) {
    return word;
  }
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * This is pulled out into its own function rather than using localeCompare
 * directly in case we every choose another sorting algorithm. Such as some
 * sort of natural compare algorithm.
 */
function compareStrings(one, two) {
  one = (one || '').toLowerCase();
  two = (two || '').toLowerCase();
  return one.localeCompare(two);
}

function isCapitalized(name) {
  return name.length > 0 && name.charAt(0).toUpperCase() === name.charAt(0);
}

function isLowerCase(name) {
  return name.toLowerCase() === name;
}

module.exports = { capitalize: capitalize, compareStrings: compareStrings, isCapitalized: isCapitalized, isLowerCase: isLowerCase };