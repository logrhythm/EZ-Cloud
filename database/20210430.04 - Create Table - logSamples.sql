-- =============================================
-- Author:		Tony Massé
-- Create date: 2021-04-30
-- Update date: 2021-11-22 - To be runnable multiple times and ignore unnecessary tasks
-- =============================================
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('[logSamples]', 'U') IS NULL
BEGIN
	CREATE TABLE [dbo].[logSamples](
		[uid] [varchar](40) NOT NULL,
		[pipelineUid] [varchar](40) NULL,
		[name] [nvarchar](250) NULL,
	CONSTRAINT [PK_logSamples] PRIMARY KEY CLUSTERED 
	(
		[uid] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]

	ALTER TABLE [dbo].[logSamples] ADD  CONSTRAINT [DF_logSamples_name]  DEFAULT (N'No name') FOR [name]
END
ELSE
BEGIN
	PRINT CONVERT(nvarchar(24), GETDATE(), 121) + ' | INFO: [logSamples] already exists. Moving on.'
END
GO
