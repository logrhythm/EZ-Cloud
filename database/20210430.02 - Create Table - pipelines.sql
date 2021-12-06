-- =============================================
-- Author:		Tony Massé
-- Create date: 2021-04-30
-- Update date: 2021-11-22 - To be runnable multiple times and ignore unnecessary tasks
-- Update date: 2021-12-03 - To add the [optionsJson] column
-- =============================================
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('[pipelines]', 'U') IS NULL
BEGIN
	CREATE TABLE [dbo].[pipelines](
		[uid] [varchar](40) NOT NULL,
		[name] [nvarchar](50) NULL,
		[status] [tinyint] NOT NULL,
		[primaryOpenCollector] [varchar](40) NULL,
		[fieldsMappingJson] [nvarchar](max) NULL,
		[collectionConfigJson] [nvarchar](max) NULL,
		[optionsJson] [nvarchar](max) NULL,
	CONSTRAINT [PK_pipelines] PRIMARY KEY CLUSTERED 
	(
		[uid] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]
END
ELSE
BEGIN
	PRINT CONVERT(nvarchar(24), GETDATE(), 121) + ' | INFO: [pipelines] already exists. Moving on.'
END
GO

-- Add the [optionsJson] column, in case of upgrade
IF NOT EXISTS(SELECT *
          FROM   INFORMATION_SCHEMA.COLUMNS
          WHERE  TABLE_NAME = 'pipelines'
                 AND COLUMN_NAME = 'optionsJson')
BEGIN
	PRINT CONVERT(nvarchar(24), GETDATE(), 121) + ' | INFO: Adding column [optionsJson] to table [pipelines].'
	ALTER TABLE dbo.pipelines ADD optionsJson nvarchar(MAX) NULL
END
GO
