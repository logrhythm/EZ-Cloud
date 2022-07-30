-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-13
-- Modified on: 2022-07-08 - To rename `ez-backend` to `oc-admin-backend`
-- Modified on: 2022-07-08 - To rename User `ezAdmin` to `ocAdmin`
-- =============================================

CREATE TABLE IF NOT EXISTS public."rbacUserToRole"
(
    "id" int NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 ),
    "login" varchar(500) NOT NULL,
    "roleUid" varchar(40) NOT NULL,
    "publisherUid" varchar(40) NOT NULL DEFAULT (gen_random_uuid()),
    PRIMARY KEY (id),
    CONSTRAINT "U_login" UNIQUE (login)
);

ALTER TABLE IF EXISTS public."rbacUserToRole"
    OWNER to "oc-admin-backend";

-- Create the basic role mapping for ocAdmin
-- INSERT
--     INTO public."rbacUserToRole"("login", "roleUid")
--     VALUES (
--         'ocAdmin'
--         ,'b7972c45-3546-4993-93ab-c0f1d9a0ffae'
--     )
--     ON CONFLICT ("login") DO NOTHING;
