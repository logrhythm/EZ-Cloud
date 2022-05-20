-- =============================================
-- Author:      Tony Massé
-- Create date: 2021-11-12
-- Update date: 2021-12-17 - To rename the [isPriviledged] column into [isPrivileged]
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
		[isPrivileged] [tinyint] NOT NULL,
	 CONSTRAINT [PK_rbacRoles] PRIMARY KEY CLUSTERED 
	(
		[uid] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]

	ALTER TABLE [dbo].[rbacRoles] ADD  CONSTRAINT [DF_rbacRoles_isPrivileged]  DEFAULT ((0)) FOR [isPrivileged]

END
ELSE
BEGIN
	PRINT CONVERT(nvarchar(24), GETDATE(), 121) + ' | INFO: [rbacRoles] already exists. Moving on.'
END
GO

-- Rename the [isPriviledged] column into [isPrivileged]
IF EXISTS(SELECT *
          FROM   INFORMATION_SCHEMA.COLUMNS
          WHERE  TABLE_NAME = 'rbacRoles'
                 AND COLUMN_NAME = 'isPriviledged')
BEGIN
	PRINT CONVERT(nvarchar(24), GETDATE(), 121) + ' | INFO: Rename the [isPriviledged] column into [isPrivileged] in table [rbacRoles].'
	BEGIN TRANSACTION
	EXECUTE sp_rename N'dbo.rbacRoles.isPriviledged', N'Tmp_isPrivileged', 'COLUMN' 
	EXECUTE sp_rename N'dbo.rbacRoles.Tmp_isPrivileged', N'isPrivileged', 'COLUMN' 
	ALTER TABLE dbo.rbacRoles SET (LOCK_ESCALATION = TABLE)
	COMMIT
END
ELSE
BEGIN
	PRINT CONVERT(nvarchar(24), GETDATE(), 121) + ' | INFO: [isPriviledged] already renamed. Moving on.'
END
GO


-- Create the basic roles
IF NOT EXISTS (SELECT *
    FROM [dbo].[rbacRoles]
    WHERE uid = 'b7972c45-3546-4993-93ab-c0f1d9a0ffae')
	INSERT INTO [dbo].[rbacRoles]
			   ([uid]
			   ,[name]
			   ,[isPrivileged])
		 VALUES
			   ('b7972c45-3546-4993-93ab-c0f1d9a0ffae'
			   ,'Admin'
			   ,1)
ELSE
BEGIN
	PRINT CONVERT(nvarchar(24), GETDATE(), 121) + ' | INFO: "Admin" Role already exists. Moving on.'
END
GO

IF NOT EXISTS (SELECT *
    FROM [dbo].[rbacRoles]
    WHERE uid = 'cb36e823-e68f-46aa-9dc1-71c35cae43b5')
	INSERT INTO [dbo].[rbacRoles]
			   ([uid]
			   ,[name]
			   ,[isPrivileged])
		 VALUES
			   ('cb36e823-e68f-46aa-9dc1-71c35cae43b5'
			   ,'User'
			   ,0)
ELSE
BEGIN
	PRINT CONVERT(nvarchar(24), GETDATE(), 121) + ' | INFO: "User" Role already exists. Moving on.'
END
GO
