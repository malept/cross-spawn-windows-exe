#include <stdio.h>

int main(int argc, char** argv) {
  FILE *file;
  char c;

  printf("Hello EXE World");
  if (argc > 1) {
    printf(", arguments passed\n");
    file = fopen(argv[1], "r");
    if (file) {
      while ((c = fgetc(file)) != EOF) {
        printf("%c", c);
      }
      fclose(file);
    } else {
      printf("ERROR: could not open file");
    }
  }
  printf("\n");
  return 0;
}
