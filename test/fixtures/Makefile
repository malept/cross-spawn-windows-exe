hello.exe: hello.c
	x86_64-w64-mingw32-gcc -Os -o $@ $^ && x86_64-w64-mingw32-strip --strip-all $@

hello.dotnet.exe: hello.cs
	mcs -out:$@ $^

all: hello.exe hello.dotnet.exe

clean:
	rm -f hello.exe hello.dotnet.exe

.PHONY: all clean
