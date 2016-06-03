#include <cstdlib>

template<typename T>
class TestClass {
public:
  T member;
  void method() {
  }
};

int main() {
  TestClass<int> t;
}
