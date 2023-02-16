/**
 * Get you the UID from the provided JSON Body, while checking the UID is of the right format
 * @param {Object} jsonBody Object containing `uid` String
 * @returns Safe UID as a String
 */
function getSafeUidFrom(jsonBody) {
  // Fail safe with an empty UID
  if (jsonBody == null) {
    return '';
  }

  const { uid } = jsonBody;
  // Strip all character that would not be valid in a UID
  const cleanUid = String(uid).replace(/[^-a-zA-Z0-9]/g, '');
  return cleanUid;
}

/**
 * Get you the Container ID from the provided JSON Body, while checking the ID is of the right format
 * @param {Object} jsonBody Object containing `uid` String
 * @returns Safe UID as a String
 */
function getSafeContainerIdFrom(jsonBody) {
  // Fail safe with an empty ID
  if (jsonBody == null) {
    return '';
  }

  const { containerId } = jsonBody;
  // Strip all character that would not be valid in a UID
  const cleanUid = String(containerId).replace(/[^-a-zA-Z0-9]/g, '');
  return cleanUid;
}

module.exports = {
  getSafeUidFrom,
  getSafeContainerIdFrom
};
