// SYNTAX TEST "text.html.hack"
<?hh

type TSomething = boolean;
// <- storage.type.typedecl.php
//   ^^^^^^^^^^ entity.name.type.typedecl
//              ^ keyword.operator.assignment.php
//                       ^ punctuation.termination.expression.php

type TGenericType<Tk, Tv, X> = Something<Tk, Array<Tv<X>>>;
// <- storage.type.typedecl.php
//   ^^^^^^^^^^^^ entity.name.type.typedecl
//               ^^^^^^^^^^^ meta.generics.php
//                           ^ keyword.operator.assignment.php
//                                                        ^ punctuation.termination.expression.php

type TFuncType = (function(int):int);
// <- storage.type.typedecl.php
//   ^^^^^^^^^ entity.name.type.typedecl
//             ^ keyword.operator.assignment.php
//                                  ^ punctuation.termination.expression.php
