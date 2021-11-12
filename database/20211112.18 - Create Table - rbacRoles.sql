-- =============================================
-- Author:      Tony Massé
-- Create date: 2021-11-12
-- =============================================
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('[rbacRoles]', 'U') IS NULL
BEGIN
	CREATE TABLE [dbo].[rbacRoles](
		[uid] [varchar](40) NOT NULL,
		[name] [nvarchar](200) NOT NULL,
		[isPriviledged] [tinyint] NOT NULL,
	 CONSTRAINT [PK_rbacRoles] PRIMARY KEY CLUSTERED 
	(
		[uid] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]

	ALTER TABLE [dbo].[rbacRoles] ADD  CONSTRAINT [DF_rbacRoles_isPriviledged]  DEFAULT ((0)) FOR [isPriviledged]

END
ELSE
BEGIN
	PRINT 'INFO: [rbacRoles] already exists. Moving on.'
END
GO

-- Create the basic roles
IF NOT EXISTS (SELECT *
    FROM [dbo].[rbacRoles]
    WHERE uid = 'b7972c45-3546-4993-93ab-c0f1d9a0ffae')
	INSERT INTO [dbo].[rbacRoles]
			   ([uid]
			   ,[name]
			   ,[isPriviledged])
		 VALUES
			   ('b7972c45-3546-4993-93ab-c0f1d9a0ffae'
			   ,'Admin'
			   ,1)
GO

IF NOT EXISTS (SELECT *
    FROM [dbo].[rbacRoles]
    WHERE uid = 'cb36e823-e68f-46aa-9dc1-71c35cae43b5')
	INSERT INTO [dbo].[rbacRoles]
			   ([uid]
			   ,[name]
			   ,[isPriviledged])
		 VALUES
			   ('cb36e823-e68f-46aa-9dc1-71c35cae43b5'
			   ,'User'
			   ,0)
GO
