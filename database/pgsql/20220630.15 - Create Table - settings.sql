-- =============================================
-- Author:		Tony Massé
-- Create date: 2022-06-30
-- Modified on: 2022-07-08 - To rename `ez-backend` to `oc-admin-backend`
-- Description: To store EZ app settings in SQL instead of flat files
-- =============================================

CREATE TABLE IF NOT EXISTS public."settings"
(
    "uid" varchar(40) NOT NULL,
    "name" varchar(50) NULL,
    "description" text NULL,
    "settingsJson" text NULL,
    PRIMARY KEY ("uid")
);

ALTER TABLE IF EXISTS public."settings"
    OWNER to "oc-admin-backend";


-- Default content

INSERT INTO public."settings"("uid", "name", "description", "settingsJson") VALUES ('6e5625e8-372d-4d4b-ac9a-615e370ac940', 'database.json', NULL, '{"config":{"server":"","authentication":{"type":"default","options":{"userName":"sa","password":""}},"options":{"encrypt":true,"port":1433,"database":"LogRhythmEMDB","requestTimeout":30000}}}') ON CONFLICT ("uid") DO NOTHING;
INSERT INTO public."settings"("uid", "name", "description", "settingsJson") VALUES ('c582c7a9-f721-4103-ab2a-e100fc0a8be4', 'ez-market-place.json', 'EZ Market configuration', format('{"deploymentUid":"%s","server":{"baseUrl":"https://journey.logrhythm.com/EZ","baseApiPath":"/API/v1","publicKey":"-----BEGIN CERTIFICATE-----\nMIIEITCCAwmgAwIBAgIJAJr9mzv3Agp4MA0GCSqGSIb3DQEBCwUAMIGmMQswCQYD\nVQQGEwJVSzESMBAGA1UECAwJQmVya3NoaXJlMRMwEQYDVQQHDApNYWlkZW5oZWFk\nMRIwEAYDVQQKDAlMb2dSaHl0aG0xETAPBgNVBAsMCFNFRGV2T3BzMR4wHAYDVQQD\nDBVqb3VybmV5LmxvZ3JoeXRobS5jb20xJzAlBgkqhkiG9w0BCQEWGHRvbnkubWFz\nc2VAbG9ncmh5dGhtLmNvbTAeFw0yMjAyMTAwMDIzMDhaFw0zMjAyMDgwMDIzMDha\nMIGmMQswCQYDVQQGEwJVSzESMBAGA1UECAwJQmVya3NoaXJlMRMwEQYDVQQHDApN\nYWlkZW5oZWFkMRIwEAYDVQQKDAlMb2dSaHl0aG0xETAPBgNVBAsMCFNFRGV2T3Bz\nMR4wHAYDVQQDDBVqb3VybmV5LmxvZ3JoeXRobS5jb20xJzAlBgkqhkiG9w0BCQEW\nGHRvbnkubWFzc2VAbG9ncmh5dGhtLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEP\nADCCAQoCggEBAM3LYpLRak9PPDoEzthGm/c14V5Tx3RfbXNarBBwkNSCjfrQWK5Z\nQkjSyxoccq5CfuVJu43vN60Pj4YfmhxbpOcIk4Gz4f4ebDB9Qzlp6MMWHsuHeiUx\n1q+yrFQUHDCvE+b22NJ1H2VWk9T9LpYbQaNX6J21GfZhfYeG44FF5yufm8BkqMz6\nO6OgJ/9vb35MlzCs9JiHp1JAbrClXqhC+2yFJgMA/2U83swibyTmD+jNnjqXUV+Z\nn4d+YTYVu/nxlE0KNEhnLfqaQyMibHjefj9/n8UHcDKfQ+4Mwe73Cij9d0idzU1K\nK4gdBqaKbj8Iprofb1kDRtXHlgOrRQMe/X8CAwEAAaNQME4wHQYDVR0OBBYEFHoR\nQinyqWIJJqio+jmp9Zw5MAQzMB8GA1UdIwQYMBaAFHoRQinyqWIJJqio+jmp9Zw5\nMAQzMAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAKqtIdHyDKZoY87w\ntyI4T9V5e2Ww3gOGsg3tUUd1P8C/fThkHc17aLb14QQz86PDKyf8yk2/Lkrdxm0A\nfTSJBmQ69kndAEkz6POaYKVJNT21iU9ML/79FtJwAfauyO3AQWPOVDFpzPWaloC0\nHSbPU0W0XmAo+WSd2UcSNech48DGeABj8f9zkZ7xK/G25B8nPKNznvchIsRvm37/\n57swiwa29+ItZG8BwtQIFaKfJ3KT+jJmz8hVuEN+MAEqixwY1KS9NYPhDy1qbF+O\n2yF0eeqi850ZeQiO8nq2P1QHQOENpuMfqA0VUoCaqOFO8wqtCT0nc5tuN+EzHrke\ncfNVFfA=\n-----END CERTIFICATE-----"}}', gen_random_uuid())) ON CONFLICT ("uid") DO NOTHING;
INSERT INTO public."settings"("uid", "name", "description", "settingsJson") VALUES ('b88b60a5-5573-4b36-b1df-fb143f17763f', 'jwt.json', 'Seed for JWT token generation.', format('{"secret":"%s","ttl":"24h"}', md5(random()::text) || md5(random()::text) || md5(random()::text) || md5(random()::text))) ON CONFLICT ("uid") DO NOTHING;
INSERT INTO public."settings"("uid", "name", "description", "settingsJson") VALUES ('68d79f70-f8a8-4eec-9d05-64fa3eccbf55', 'masterID', 'SIEM Master License ID', '{"MasterID": -1}') ON CONFLICT ("uid") DO NOTHING;
-- INSERT INTO public."settings"("uid", "name", "description", "settingsJson") VALUES ('uid', 'name', 'description', '{}') ON CONFLICT ("uid") DO NOTHING;


