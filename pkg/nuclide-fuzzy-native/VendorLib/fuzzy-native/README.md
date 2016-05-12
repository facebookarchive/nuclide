# fuzzy-native

[![Build Status](https://travis-ci.org/hansonw/fuzzy-native.svg?branch=master)](https://travis-ci.org/hansonw/fuzzy-native)

Fuzzy string matching library package for Node. Implemented natively in C++ for speed with support for multithreading.

The scoring algorithm is heavily tuned for file paths, but should work for general strings.

## API

(from [main.js.flow](lib/main.js.flow))

```
export type MatcherOptions = {
  // Default: false
  caseSensitive?: boolean,

  // Default: infinite
  maxResults?: number,

  // Maximum gap to allow between consecutive letters in a match.
  // Provide a smaller maxGap to speed up query results.
  // Default: unlimited
  maxGap?: number;

  // Default: 1
  numThreads?: number,

  // Default: false
  recordMatchIndexes?: boolean,
}

export type MatchResult = {
  value: string,

  // A number in the range (0-1]. Higher scores are more relevant.
  // 0 denotes "no match" and will never be returned.
  score: number,

  // Matching character index in `value` for each character in `query`.
  // This can be costly, so this is only returned if `recordMatchIndexes` was set in `options`.
  matchIndexes?: Array<number>,
}

export class Matcher {
  constructor(candidates: Array<string>) {}

  // Returns all matching candidates (subject to `options`).
  // Will be ordered by score, descending.
  match: (query: string, options?: MatcherOptions) => Array<MatchResult>;

  addCandidates: (candidates: Array<string>) => void;
  removeCandidates: (candidates: Array<string>) => void;
  setCandidates: (candidates: Array<string>) => void;
}
```

See also the [spec](spec/fuzzy-native-spec.js) for basic usage.

## Scoring algorithm

The scoring algorithm is mostly borrowed from @wincent's excellent [command-t](https://github.com/wincent/command-t) vim plugin; most of the code is from [his implementation in  match.c](https://github.com/wincent/command-t/blob/master/ruby/command-t/match.c).

Read [the source code](src/score_match.cpp) for a quick overview of how it works (the function `recursive_match`).

NB: [score_match.cpp](src/score_match.cpp) and [score_match.h](src/score_match.h) have no dependencies besides the C/C++ stdlib and can easily be reused for other purposes.

There are a few notable additional optimizations:

- Before running the recursive matcher, we first do a backwards scan through the haystack to see if the needle exists at all. At the same time, we compute the right-most match for each character in the needle to prune the search space.
- For each candidate string, we pre-compute and store a bitmask of its letters in `MatcherBase`. We then compare this the "letter bitmask" of the query to quickly prune out non-matches.
