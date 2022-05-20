-- =============================================
-- Author:		Tony Massé
-- Create date: 2021-04-30
-- Update date: 2021-11-22 - To be runnable multiple times and ignore unnecessary tasks
-- =============================================
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('[logSampleLogs]', 'U') IS NULL
BEGIN
	CREATE TABLE [dbo].[logSampleLogs](
		[logSampleUid] [varchar](40) NOT NULL,
		[text] [nvarchar](max) NOT NULL
	) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
END
ELSE
BEGIN
	PRINT CONVERT(nvarchar(24), GETDATE(), 121) + ' | INFO: [logSampleLogs] already exists. Moving on.'
END
GO

DROP INDEX IF EXISTS [IX_logSampleLogs-logSampleUid] ON [dbo].[logSampleLogs] WITH ( ONLINE = OFF )
GO

CREATE CLUSTERED INDEX [IX_logSampleLogs-logSampleUid] ON [dbo].[logSampleLogs]
(
	[logSampleUid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO


