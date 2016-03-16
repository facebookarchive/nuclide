'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';
import typeof * as HackService from '../../nuclide-hack-base/lib/HackService';

import {getServiceByNuclideUri} from '../../nuclide-remote-connection';
import invariant from 'assert';

const MATCH_PREFIX_CASE_SENSITIVE_SCORE = 6;
const MATCH_PREFIX_CASE_INSENSITIVE_SCORE = 4;
const MATCH_TOKEN_CASE_SENSITIVE_SCORE = 2;
const MATCH_TOKEN_CASE_INSENSITIVE_SCORE = 0;
const MATCH_PRIVATE_FUNCTION_PENALTY = -4;
const MATCH_APLHABETICAL_SCORE = 1;
const HACK_SERVICE_NAME = 'HackService';

function compareHackCompletions(token: string): (matchText1: string, matchText2: string) => number {
  const tokenLowerCase = token.toLowerCase();

  return (matchText1: string, matchText2: string) => {
    const matchTexts = [matchText1, matchText2];
    const scores = matchTexts.map((matchText, i) => {
      if (matchText.startsWith(token)) {
        // Matches starting with the prefix gets the highest score.
        return MATCH_PREFIX_CASE_SENSITIVE_SCORE;
      } else if (matchText.toLowerCase().startsWith(tokenLowerCase)) {
        // Ignore case score matches gets a good score.
        return MATCH_PREFIX_CASE_INSENSITIVE_SCORE;
      }

      let score;
      if (matchText.indexOf(token) !== -1) {
        // Small score for a match that contains the token case-sensitive.
        score = MATCH_TOKEN_CASE_SENSITIVE_SCORE;
      } else {
        // Zero score for a match that contains the token without case-sensitive matching.
        score = MATCH_TOKEN_CASE_INSENSITIVE_SCORE;
      }

      // Private functions gets negative score.
      if (matchText.startsWith('_')) {
        score += MATCH_PRIVATE_FUNCTION_PENALTY;
      }
      return score;
    });
    // Finally, consider the alphabetical order, but not higher than any other score.
    if (matchTexts[0] < matchTexts[1]) {
      scores[0] += MATCH_APLHABETICAL_SCORE;
    } else {
      scores[1] += MATCH_APLHABETICAL_SCORE;
    }
    return scores[1] - scores[0];
  };
}

function getHackService(filePath: NuclideUri): HackService {
  const hackRegisteredService = getServiceByNuclideUri(HACK_SERVICE_NAME, filePath);
  invariant(hackRegisteredService);
  return hackRegisteredService;
}


module.exports = {
  compareHackCompletions,
  getHackService,
};
