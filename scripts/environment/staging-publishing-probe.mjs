/**
 * Repository-owned publishing observation.
 * An active main-branch Pages workflow is not `disabled_manually`.
 * GitHub's manual disable switch is not visible from the workflow file, so this
 * probe cannot by itself establish a publishing PASS.
 */
import { readFileSync } from "node:fs";

export function probePublishingWorkflow(workflowText) {
  if (typeof workflowText !== "string" || workflowText.length === 0) {
    return {
      deployWorkflowState: "UNKNOWN",
      pagesSourceKnown: false,
      unsafeActivePublishingPath: true,
    };
  }
  const activeOnMain = /branches:\s*\[main\]/.test(workflowText);
  const pagesSourceKnown = workflowText.includes("publish_dir:") && workflowText.includes("cname:");
  return {
    deployWorkflowState: activeOnMain ? "active_on_main" : "UNKNOWN",
    pagesSourceKnown,
    unsafeActivePublishingPath: activeOnMain,
  };
}

/**
 * @param {string} workflowPath
 */
export function readPublishingWorkflow(workflowPath) {
  try {
    return probePublishingWorkflow(readFileSync(workflowPath, "utf8"));
  } catch {
    return probePublishingWorkflow("");
  }
}
