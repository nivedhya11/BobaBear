/**
 * Staging source-identity finding for recovery evidence.
 * Emits only when the caller supplies a complete independently observed identity.
 * Never invents compose/volume/system-id fields.
 */

/**
 * @param {object} [options]
 * @param {object} [options.stagingSourceIdentity]
 * @returns {Array<Record<string, unknown>>}
 */
export function stagingSourceIdentityFindings(options = {}) {
  const identity = options.stagingSourceIdentity;
  if (!identity || typeof identity !== "object") return [];
  const composeProject = typeof identity.composeProject === "string" ? identity.composeProject.trim() : "";
  const postgresContainer =
    typeof identity.postgresContainer === "string" ? identity.postgresContainer.trim() : "";
  const postgresVolume = typeof identity.postgresVolume === "string" ? identity.postgresVolume.trim() : "";
  const databaseSystemIdentifier =
    typeof identity.databaseSystemIdentifier === "string" ? identity.databaseSystemIdentifier.trim() : "";
  const postgresMajor =
    typeof identity.postgresMajor === "number" && Number.isInteger(identity.postgresMajor)
      ? identity.postgresMajor
      : null;
  if (!composeProject || !postgresContainer || !postgresVolume || !databaseSystemIdentifier || postgresMajor == null) {
    return [];
  }
  return [
    {
      code: "STAGING_SOURCE_IDENTITY",
      composeProject,
      postgresContainer,
      postgresVolume,
      databaseSystemIdentifier,
      postgresMajor,
    },
  ];
}
