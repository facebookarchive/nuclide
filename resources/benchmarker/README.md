# benchmarker

This folder contains a spec (that can be run with `apm test`) that runs a variety of benchmark tests
to measure the performance and behaviors of Atom and Nuclide.

New benchmarks can be added to the `benchmarks` folder.

Note that this folder is not a package in its own right and cannot be installed.

## Usage:

This will run all the benchmarks found in the `benchmarks` folder:

    apm test

The output will look something like:

    Renderer process started
    Writing results for run to /tmp/nuclide-benchmarker-results/1439136451762
    Writing raw results for open-edit-save-by-size to /tmp/nuclide-benchmarker-results/1439136451762/open-edit-save-by-size.tsv
    open-edit-save-by-size: iteration 1 of 37, repetition 1 of 3
    open-edit-save-by-size: iteration 1 of 37, repetition 2 of 3
    open-edit-save-by-size: iteration 1 of 37, repetition 3 of 3
    open-edit-save-by-size: iteration 2 of 37, repetition 1 of 3
    ...
    open-edit-save-by-size: iteration 37 of 37, repetition 3 of 3
    Results for open-edit-save-by-size are in /tmp/nuclide-benchmarker-results/1439136451762/open-edit-save-by-size.processed.tsv
    All results for the run are in /tmp/nuclide-benchmarker-results/1439136451762

    Finished in 8.601 seconds
    1 test, 0 assertions, 0 failures, 0 skipped
    Tests passed

To specify just one benchmark by name, set the BENCHMARK environment variable:

    BENCHMARK=open-edit-save-by-size apm test

(There is a good reason this can't be passed in as a command line argument, currently.)

No packages are installed by default for benchmarks (though of course individual benchmarks may do so). If you want to load a set of packages and see how they affect the results, use the `BENCHMARK_PACKAGES` environment variable to provide a comma-separated list:

    BENCHMARK_PACKAGES=language-javascript,nuclide-flow apm test

You can of course set both options:

    BENCHMARK_PACKAGES=language-javascript,nuclide-flow BENCHMARK=open-edit-save-by-size apm test

## Writing a new benchmark

A benchmark is a module in the `benchmarks` folder. It has a `run` method that is called multiple times: for every 'iteration' of the benchmark, and for every 'repetition' of those iterations.

### Iterations and repetitions

Iterations are intended to represent some varying conditions for the benchmark. For example, the `open-edit-save-by-size` benchmark uses the iteration number to try testing larger and larger files. Benchmarks might also want to gather results with a succession of packages installed. The iteration number is just an incrementing argument passed into the `run` function so can be used for any purpose.

In fact, the harness can call the `run` function with the same iteration argument multiple times. This is called a repetition, and is simply to allow the harness to aggregate multiple runs and average the results. This does not get passed into the `run` function. But for every combination of iteration and repetition, a record is written to a `.tsv` file as the test run progresses.

At the end of the run, a `.processed.tsv` file will be generated. This smoothes the results by averaging the results from across multiple repetitions for a given iteration. In other words, the iteration number is used as the key to aggregate the results from multiple repetitions.

### Benchmark API

Every benchmark module needs exports the following properties:

  * **description**: a string used to describe the test in Jasmine.
  * **columns**: an array of the columns of data this benchmark produces, which will get written to the TSV results file.
  * **timeout**: how long in milliseconds the benchmark should take to execute a single `run` function.
  * **iterations**: how many iterations this benchmark needs.
  * **repetitions**: how many times each iteration should be called; `3` is suitable.
  * **run**: an async function that takes the iteration number as an argument and returns a record object - in other words a single object with a key for each of the `columns` specified above, containing a result value.

A very simple benchmark might look like:

    'use babel';
    /* @flow */
    module.exports = {
      description: 'cubes square numbers',
      columns: ['number', 'stars', 'cube'],
      timeout: 1000,                        // shouldn't take too long ;)
      iterations: 5,                        // 0, 1, 4, 9, 16
      repetitions: 2,                       // just to exercise the aggregation
      run: async (iteration: number): Object => {
        var square = Math.pow(iteration, 2);
        var stars = '*'.repeat(iteration);  // string results can be returned too
        return {number: square, stars: stars, cube: Math.pow(square, 3)};
      },
    };

This will result in a results file that looks like:

    iteration  number  stars  cube
    0          0.00           0.00
    1          1.00    *      1.00
    2          4.00    **     64.00
    3          9.00    ***    729.00
    4          16.00   ****   4096.00

Strings results can be be returned in records as well as numeric values, and they will be aggregated in the following way. If every repetition returns the same string, then that string is simply written out (as in the example above). If, for whatever reason, different repetitions return different string values, they are concatenated as a comma-separated string.
