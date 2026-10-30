import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(projectRoot, relativePath), "utf8");
}

const assessment = read("docs/platform/engineering/customer-otp-transport-assessment.md");
const adr = read("docs/platform/decisions/ADR-004-identity-authentication-sessions.md");
const foundation = read("docs/platform/accepted-foundation-operating-rules.md");
const index = read("docs/platform/README.md");
const factory = read("src/server/customer-auth/provider/factory.ts");

describe("customer OTP transport assessment", () => {
  it("stays non-authoritative and does not allocate a decision id", () => {
    assert.match(assessment, /AUTHORITY = NON_AUTHORITATIVE/);
    assert.match(assessment, /PROVIDER_SELECTED = NO/);
    assert.match(assessment, /LIVE_PROVIDER_ACTIVATION = NOT_AUTHORIZED/);
    assert.match(assessment, /FORMAL_REGISTER_STATUS = NOT_CURRENT/);
    assert.match(assessment, /DECISION_REGISTER_ROW_ADDED = NO/);
    assert.match(assessment, /MSG91_GET_VERIFY = BLOCKED/);
    assert.match(assessment, /STAGING_AND_PRODUCTION_OTP = FAIL_CLOSED/);
    assert.equal(assessment.includes("D-388"), false);
    assert.equal(assessment.includes("D-389"), false);
  });

  it("records Option A as evidence on the ADR without a register row", () => {
    assert.match(adr, /OTP_TRANSPORT_POLICY = OPTION_A_APPROVED/);
    assert.match(adr, /FORMAL_REGISTER_ALLOCATION = BLOCKED/);
    assert.match(adr, /DECISION_REGISTER_ROW_ADDED = NO/);
    assert.match(adr, /PROVIDER_SELECTED = NO/);
    assert.match(adr, /customer-otp-transport-assessment\.md/);
  });

  it("points the foundation rules and the doc index at the same assessment", () => {
    assert.match(foundation, /OTP transport evidence \(not a decision ID\)/);
    assert.match(foundation, /customer-otp-transport-assessment\.md/);
    assert.match(foundation, /CUSTOMER_OTP_PRODUCTION_PROVIDER_UNAVAILABLE/);
    assert.match(index, /engineering\/customer-otp-transport-assessment\.md/);
    assert.match(index, /NON-AUTHORITATIVE ASSESSMENT/);
  });

  it("leaves the production provider factory fail-closed", () => {
    assert.match(factory, /CustomerOtpProviderKind = "local" \| "disabled"/);
    assert.match(factory, /CUSTOMER_OTP_PRODUCTION_PROVIDER_UNAVAILABLE/);
    assert.match(factory, /This factory does not select/);
  });
});
