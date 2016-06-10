#include <iostream>
#include <cstdlib>
#include <pthread.h>
#include <unistd.h>

using namespace std;

#define NUM_THREADS     1

void* PrintHello(void *) {
   cout << "Hello World!" << endl;
   pthread_exit(NULL);
}

int main () {
  pthread_t threads[NUM_THREADS];
  for(int i=0; i < NUM_THREADS; ++i) {
    cout << "main() : creating thread, " << i << endl;
    int rc = pthread_create(&threads[i], NULL,
                        PrintHello, nullptr);
    if (rc){
       cout << "Error:unable to create thread," << rc << endl;
       exit(-1);
    }
  }
  sleep(5);
  pthread_exit(NULL);
}
