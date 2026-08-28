/*
 * PURPOSE:
 * Legacy admin media management module.
 *
 * FLOW:
 * Legacy Media Compatibility Flow
 *
 * RESPONSIBILITY:
 * Preserves compatibility re-exports for ProjectMediaPage and ConfigurationMediaPage.
 * Active routing in AppRouter directly routes to dedicated pages:
 * - HomeMediaPage (/admin/media)
 * - ProjectMediaPage (/admin/projects/:projectId/media)
 * - ConfigurationMediaPage (/admin/configurations/:configurationId/media)
 */

export { ProjectMediaPage } from "./ProjectMediaPage";
export { ConfigurationMediaPage } from "./ConfigurationMediaPage";