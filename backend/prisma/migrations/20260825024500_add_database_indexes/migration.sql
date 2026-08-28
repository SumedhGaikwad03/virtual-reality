-- CreateIndex
CREATE INDEX "Configuration_projectId_idx" ON "Configuration"("projectId");

-- CreateIndex
CREATE INDEX "Project_developerId_idx" ON "Project"("developerId");

-- CreateIndex
CREATE INDEX "Project_publishStatus_featured_idx" ON "Project"("publishStatus", "featured");

-- CreateIndex
CREATE INDEX "ProjectHighlight_projectId_idx" ON "ProjectHighlight"("projectId");

-- CreateIndex
CREATE INDEX "ProjectAmenity_projectId_idx" ON "ProjectAmenity"("projectId");

-- CreateIndex
CREATE INDEX "Media_developerId_idx" ON "Media"("developerId");

-- CreateIndex
CREATE INDEX "Media_projectId_idx" ON "Media"("projectId");

-- CreateIndex
CREATE INDEX "Media_configurationId_idx" ON "Media"("configurationId");

-- CreateIndex
CREATE INDEX "Media_context_isActive_idx" ON "Media"("context", "isActive");

-- CreateIndex
CREATE INDEX "Lead_projectId_idx" ON "Lead"("projectId");

-- CreateIndex
CREATE INDEX "Lead_configurationId_idx" ON "Lead"("configurationId");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "PasswordResetToken_adminId_idx" ON "PasswordResetToken"("adminId");
