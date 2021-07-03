import { is64BitArch } from "../src/arch";
import test from "ava";

test("arm64 is a 64-bit arch", (t) => {
  t.true(is64BitArch("arm64"));
});

test("x64 is a 64-bit arch", (t) => {
  t.true(is64BitArch("x64"));
});

test("ia32 is not a 64-bit arch", (t) => {
  t.false(is64BitArch("ia32"));
});

test("armv7l is not a 64-bit arch", (t) => {
  t.false(is64BitArch("armv7l"));
});
