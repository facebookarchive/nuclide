// SYNTAX TEST "text.html.hack"
<?hh

function something<T>(bool $flag) {
// <- storage.type.function.php
//       ^^^^^^^^^ entity.name.function.php
//                ^^^ meta.generics.php
//                 ^ storage.type.php
}

function nested<TTuple<TMap<Tk, Tv>, TVector<Tv>>>(bool $flag) {
// <- storage.type.function.php
//       ^^^^^^ entity.name.function.php
//             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.generics.php
//              ^^^^^^ ^^^^ ^^  ^^   ^^^^^^^ ^^ storage.type.php
}

function constrained<T as num>(bool $flag) {
// <- storage.type.function.php
//       ^^^^^^^^^^^ entity.name.function.php
//                  ^^^^^^^^^^ meta.generics.php
//                   ^^^^^^^^ storage.type.php
}

function constrained<T super TSuper>(bool $flag) {
// <- storage.type.function.php
//       ^^^^^^^^^^^ entity.name.function.php
//                  ^^^^^^^^^^^^^^^^ meta.generics.php
//                   ^^^^^^^^^^^^^^ storage.type.php
}

function something<+T, -Ta>(bool $flag) {
// <- storage.type.function.php
//       ^^^^^^^^^ entity.name.function.php
//                ^^^^^^^^^ meta.generics.php
//                 ^^  ^^^ storage.type.php
}

class Something<+T, -Ta> {
// <- storage.type.class.php
//    ^^^^^^^^^ entity.name.type.class.php
//             ^^^^^^^^^ meta.generics.php
//              ^^  ^^^ storage.type.php
}

trait Something<+T, -Ta> {
// <- storage.type.trait.php
//    ^^^^^^^^^ entity.name.type.class.php
//             ^^^^^^^^^ meta.generics.php
//              ^^  ^^^ storage.type.php
}

interface Something<+T, -Ta> extends Another<T>, YetAnother<Ta> {
// <- storage.type.interface.php
//        ^^^^^^^^^                  ^^^^^^^     ^^^^^^^^^^ entity.name.type.class.php
//                 ^^^^^^^^^                ^^^            ^^^^ meta.generics.php
//                  ^^  ^^^                  ^              ^^ storage.type.php
//                           ^^^^^^^ storage.modifier.extends.php
}
