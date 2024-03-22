export default function () {
  return {
    errorWikiUrlBase: ( // Base URL for the Documentation page with Error codes
      process.env.DEV
        // ? 'https://docs-staging.logrhythm.com/docs/OCbeats/logrhythm-open-collector/oc-admin/oc-admin-error-messages#OCAdminErrorMessages-'
        ? 'http://localhost:8443/aka/OCAdminErrorMessages-'
        // : 'https://docs.logrhythm.com/docs/OCbeats/logrhythm-open-collector/oc-admin/oc-admin-error-messages#OCAdminErrorMessages-'
        : 'https://journey.logrhythm.com/EZ/aka/OCAdminErrorMessages-'
    ),
    helpWikiUrlBase: ( // Base URL for the Help Documentation page
      process.env.DEV
        // ? 'https://docs-staging.logrhythm.com/docs/OCbeats/logrhythm-open-collector/oc-admin/navigating-and-using-oc-admin#NavigatingandUsingOCAdmin-'
        ? 'http://localhost:8443/aka/OCAdminHelp-'
        // : 'https://docs.logrhythm.com/docs/OCbeats/logrhythm-open-collector/oc-admin/navigating-and-using-oc-admin#NavigatingandUsingOCAdmin-'
        : 'https://journey.logrhythm.com/EZ/aka/OCAdminHelp-'
    )
  }
}
