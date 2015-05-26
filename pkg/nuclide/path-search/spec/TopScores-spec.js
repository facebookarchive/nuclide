'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var TopScores = require('../lib/TopScores');

describe('TopScores', () => {
  it('.getTopScores() returns the top scores', () => {
    var topScores = new TopScores(3);

    var one = {score: 1, value: 'one'};
    var two = {score: 2, value: 'two'};
    var three = {score: 3, value: 'three'};
    var four = {score: 4, value: 'four'};
    var five = {score: 5, value: 'five'};
    var six = {score: 6, value: 'six'};

    topScores.insert(six);
    topScores.insert(four);
    topScores.insert(two);
    topScores.insert(three);
    topScores.insert(one);
    topScores.insert(five);

    expect(topScores.getTopScores()).toEqual([six, five, four]);
  });

  it('getTopScores() uses Score.value as a tiebreaker', () => {
    var scores = [
      {score: 1, value: 'Cat'},
      {score: 1, value: 'apple'},
      {score: 1, value: 'Apple'},
      {score: 1, value: ''},
      {score: 2, value: 'Z'},
      {score: 3, value: 'ball'},
      {score: 1, value: 'cAt'},
      {score: 1, value: 'cat'},
      {score: 1, value: 'CAT'},
    ];
    var topScores = new TopScores(scores.length);
    scores.forEach(score => topScores.insert(score));
    expect(topScores.getTopScores().map(score => score.value)).toEqual([
        'ball',
        'Z',
        '',
        'Apple',
        'apple',
        'CAT',
        'Cat',
        'cAt',
        'cat',
    ]);
  });
});
