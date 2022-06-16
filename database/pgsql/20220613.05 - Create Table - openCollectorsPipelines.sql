-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-13
-- =============================================

CREATE TABLE IF NOT EXISTS public."openCollectorsPipelines"
(
    "openCollectorUid" varchar(40) NOT NULL,
    "pipelineUid" varchar(40) NOT NULL,
    "state" smallint NOT NULL DEFAULT 0,
    PRIMARY KEY ("openCollectorUid", "pipelineUid")
);

ALTER TABLE IF EXISTS public."openCollectorsPipelines"
    OWNER to "ez-backend";

CREATE INDEX IF NOT EXISTS "IX_openCollectorsPipelines_openCollectorUid-pipelineUid"
    ON public."openCollectorsPipelines" USING btree
    ("openCollectorUid" ASC NULLS LAST, "pipelineUid" ASC NULLS LAST)
;

ALTER TABLE IF EXISTS public."openCollectorsPipelines"
    CLUSTER ON "IX_openCollectorsPipelines_openCollectorUid-pipelineUid";
