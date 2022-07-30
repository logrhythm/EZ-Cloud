-- =============================================
-- Author:      Tony Massé
-- Create date: 2021-11-12
-- Update date: 2022-02-09 - Adding column [publisherUid]
-- =============================================
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('[rbacUserToRole]', 'U') IS NULL
BEGIN
	CREATE TABLE [dbo].[rbacUserToRole](
		[id] [int] IDENTITY(1,1) NOT NULL,
		[login] [nvarchar](500) NOT NULL,
		[roleUid] [varchar](40) NOT NULL,
		[publisherUid] [varchar](40) NOT NULL DEFAULT (LOWER(NEWID())),
	 CONSTRAINT [PK_rbacUserToRole] PRIMARY KEY CLUSTERED 
	(
		[id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]
END
ELSE
BEGIN
	PRINT CONVERT(nvarchar(24), GETDATE(), 121) + ' | INFO: [rbacUserToRole] already exists. Moving on.'
END
GO

-- Add the [publisherUid] column, in case of upgrade
IF NOT EXISTS(SELECT *
          FROM   INFORMATION_SCHEMA.COLUMNS
          WHERE  TABLE_NAME = 'rbacUserToRole'
                 AND COLUMN_NAME = 'publisherUid')
BEGIN
	PRINT CONVERT(nvarchar(24), GETDATE(), 121) + ' | INFO: Adding column [publisherUid] to table [rbacUserToRole].'
	ALTER TABLE dbo.rbacUserToRole ADD publisherUid varchar(40) NOT NULL DEFAULT (LOWER(NEWID()))
END
GO


-- Create the basic role mapping for ocAdmin
IF NOT EXISTS (SELECT *
    FROM [dbo].[rbacUserToRole]
    WHERE [login] = 'ocAdmin')
	INSERT INTO [dbo].[rbacUserToRole]
			   ([login]
			   ,[roleUid])
		 VALUES
			   ('ocAdmin'
			   ,'b7972c45-3546-4993-93ab-c0f1d9a0ffae')
GO

