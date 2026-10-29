import assert from "node:assert/strict";
import { chmodSync, lstatSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import {
  SecretFileModeError,
  copyOwnerOnlySecretFile,
  createOwnerOnlySecretFile,
  inspectOwnerOnlyFile,
} from "./staging-secret-files.mjs";

test("new secret files are 0600 even when umask is permissive", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "boba-secret-mode-"));
  const previous = process.umask(0o000);
  try {
    const file = path.join(dir, "secret.env");
    createOwnerOnlySecretFile(file, "TOKEN=not-logged\n");
    assert.equal(lstatSync(file).mode & 0o777, 0o600);
    assert.equal(inspectOwnerOnlyFile(file).ok, true);
  } finally {
    process.umask(previous);
    rmSync(dir, { recursive: true, force: true });
  }
});

test("an existing 0644 secret is rejected and left unchanged", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "boba-secret-mode-"));
  try {
    const source = path.join(dir, "source.env");
    const dest = path.join(dir, "dest.env");
    writeFileSync(source, "TOKEN=source\n", { mode: 0o600 });
    writeFileSync(dest, "TOKEN=original\n", { mode: 0o644 });
    assert.throws(() => copyOwnerOnlySecretFile(source, dest), SecretFileModeError);
    assert.equal(lstatSync(dest).mode & 0o777, 0o644);
    assert.doesNotMatch(
      (() => {
        try {
          copyOwnerOnlySecretFile(source, dest);
          return "";
        } catch (error) {
          return String(error);
        }
      })(),
      /TOKEN=/,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a symlink destination is rejected", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "boba-secret-mode-"));
  try {
    const source = path.join(dir, "source.env");
    const real = path.join(dir, "real.env");
    const link = path.join(dir, "link.env");
    writeFileSync(source, "TOKEN=source\n", { mode: 0o600 });
    writeFileSync(real, "TOKEN=real\n", { mode: 0o600 });
    symlinkSync(real, link);
    assert.throws(() => copyOwnerOnlySecretFile(source, link), SecretFileModeError);
    assert.equal(lstatSync(link).isSymbolicLink(), true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("path traversal outside the destination parent is not created", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "boba-secret-mode-"));
  const outside = path.join(os.tmpdir(), `boba-secret-escape-${process.pid}.env`);
  try {
    chmodSync(dir, 0o700);
    assert.throws(
      () =>
        createOwnerOnlySecretFile(path.join(dir, "..", path.basename(outside)), "TOKEN=nope\n", {
          confineTo: dir,
        }),
      SecretFileModeError,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
    rmSync(outside, { force: true });
  }
});
