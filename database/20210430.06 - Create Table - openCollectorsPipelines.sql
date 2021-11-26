-- =============================================
-- Author:		Tony Massé
-- Create date: 2021-04-30
-- Update date: 2021-05-10 - 
-- Update date: 2021-11-22 - To be runnable multiple times and ignore unnecessary tasks
-- =============================================
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('[openCollectorsPipelines]', 'U') IS NULL
BEGIN
	CREATE TABLE [dbo].[openCollectorsPipelines](
		[openCollectorUid] [varchar](40) NOT NULL,
		[pipelineUid] [varchar](40) NOT NULL,
		[state] [tinyint] NOT NULL
	) ON [PRIMARY]

	ALTER TABLE [dbo].[openCollectorsPipelines] ADD  CONSTRAINT [DF_openCollectorsPipelines_state]  DEFAULT ((0)) FOR [state]
END
ELSE
BEGIN
	PRINT CONVERT(nvarchar(24), GETDATE(), 121) + ' | INFO: [openCollectorsPipelines] already exists. Moving on.'
END
GO

DROP INDEX IF EXISTS [IX_openCollectorsPipelines_openCollectorUid-pipelineUid] ON [dbo].[openCollectorsPipelines] WITH ( ONLINE = OFF )
GO

CREATE CLUSTERED INDEX [IX_openCollectorsPipelines_openCollectorUid-pipelineUid] ON [dbo].[openCollectorsPipelines]
(
	[openCollectorUid] ASC,
	[pipelineUid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO


