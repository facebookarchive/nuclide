#include <cstdlib>

template<typename T>
class TestClass {
public:
  T member;
  /// Test documentation
  void method() {
  }
};

int main() {
  TestClass<int> t;
}
