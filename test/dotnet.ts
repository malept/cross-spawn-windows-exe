import * as path from "path";
import { determineDotNetWrapper, spawnDotNet } from "../src/dotnet";
import { normalizePath } from "../src/normalize-path";
import test from "ava";

const fixturePath =
  process.env.CSWE_TEST_FIXTURES || path.resolve(__dirname, "fixtures");

// Tests are serial because changing environment variables isn't threadsafe.

test.afterEach(() => {
  delete process.env.MONO_BINARY;
});

test.serial("determineDotNetWrapper uses the custom path if supplied", (t) => {
  process.env.MONO_BINARY = "mono-binary";
  t.is(determineDotNetWrapper("foo"), "foo");
});

test.serial(
  "determineDotNetWrapper uses the MONO_BINARY environment variable if supplied",
  (t) => {
    process.env.MONO_BINARY = "mono-binary";
    t.is(determineDotNetWrapper(), "mono-binary");
  }
);

test.serial(
  "determineDotNetWrapper falls back to the mono binary if no other paths are supplied",
  (t) => {
    t.is(determineDotNetWrapper(), "mono");
  }
);

test.serial("runs a dotnet binary", async (t) => {
  t.is(process.env.MONO_BINARY, undefined);
  const output = await spawnDotNet(path.join(fixturePath, "hello.dotnet.exe"));
  t.is(output.trim(), "Hello DotNet World");
});

test.serial("runs a dotnet binary with arguments", async (t) => {
  t.is(process.env.MONO_BINARY, undefined);
  const output = await spawnDotNet(path.join(fixturePath, "hello.dotnet.exe"), [
    "argument.txt",
  ]);
  t.is(
    output.trim().replace(/\r/g, ""),
    "Hello DotNet World, arguments passed\nERROR: could not open file"
  );
});

test.serial("runs a Windows binary with a filename argument", async (t) => {
  t.is(process.env.MONO_BINARY, undefined);
  const output = await spawnDotNet(path.join(fixturePath, "hello.dotnet.exe"), [
    await normalizePath(path.join(fixturePath, "input.txt")),
  ]);
  t.is(
    output.trim().replace(/\r/g, ""),
    "Hello DotNet World, arguments passed\nInput\nFile"
  );
});
