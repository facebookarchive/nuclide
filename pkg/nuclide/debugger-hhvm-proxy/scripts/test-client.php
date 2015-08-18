<?php

function foo($arg) {
  echo "foo\n";
  echo $arg;
}

function test_lambda() {
  $x = 'bar';
  return function ($y) use ($x) {
    return $x . $y;
  };
}
$fn = test_lambda();
echo $fn('baz'); // Outputs barbaz

echo "Hello\n";
echo "World\n";

foo(42);
foo("hello");
foo(true);
foo(null);
foo(42.5);
foo();

class CLS {

}

foo(new CLS);
