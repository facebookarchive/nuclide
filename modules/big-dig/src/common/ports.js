'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.





















parsePorts = parsePorts;function parsePorts(portsDescriptor) {
  const ranges = [];
  const descriptors = portsDescriptor.
  split(',').
  map(x => x.trim()).
  filter(x => x !== '');
  for (const descriptor of descriptors) {
    let range = null;
    if (/^\d+$/.test(descriptor)) {
      range = {
        start: parseNonNegativeIntOrThrow(descriptor),
        length: 1 };

    } else {
      const match = descriptor.match(/^(\d+)-(\d+)$/);
      if (match != null) {
        const start = parseNonNegativeIntOrThrow(match[1]);
        const end = parseNonNegativeIntOrThrow(match[2]);
        const delta = end - start;
        range = {
          start,
          length: delta + (delta < 0 ? -1 : 1) };

      } else {
        throw Error(`Could not parse ports from: "${descriptor}".`);
      }
    }
    ranges.push(range);
  }

  return new Ports(ranges);
}

/**
   * Class that is an iterable for port numbers.
   */
// $FlowIssue https://github.com/facebook/flow/issues/2286
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
 */ /**
     * Represents a range of ports by an initial integer paired with the number of
     * elements in the range. If `length` is negative, then the range counts "down"
     * from `start` instead of counting "up". `length` should never be zero.
     */class Ports {constructor(ranges) {this._ranges = ranges;} // $FlowIssue https://github.com/facebook/flow/issues/2286
  *[Symbol.iterator]() {for (const _ref of this._ranges) {const { start, length } = _ref;const delta = length < 0 ? -1 : 1;let offset = 0;while (offset !== length) {yield start + offset;offset += delta;}
    }
  }}


function parseNonNegativeIntOrThrow(str) {
  const value = parseInt(str, 10);
  if (isNaN(value)) {
    throw Error(`"${str}" could not be parsed as a valid integer.`);
  } else if (value === Infinity || value === -Infinity) {
    throw Error(`${str} parses to an extrema: ${value}.`);
  } else if (value < 0) {
    throw Error(`${str} parses to a negative number: ${value}.`);
  } else {
    return value;
  }
}