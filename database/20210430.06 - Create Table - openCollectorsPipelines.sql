/****** Object:  Table [dbo].[openCollectorsPipelines]    Script Date: 10/05/2021 12:17:13 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[openCollectorsPipelines](
	[openCollectorUid] [varchar](40) NOT NULL,
	[pipelineUid] [varchar](40) NOT NULL,
	[state] [tinyint] NOT NULL
) ON [PRIMARY]

GO

ALTER TABLE [dbo].[openCollectorsPipelines] ADD  CONSTRAINT [DF_openCollectorsPipelines_state]  DEFAULT ((0)) FOR [state]
GO

DROP INDEX IF EXISTS [IX_openCollectorsPipelines_openCollectorUid-pipelineUid] ON [dbo].[openCollectorsPipelines] WITH ( ONLINE = OFF )
GO

CREATE CLUSTERED INDEX [IX_openCollectorsPipelines_openCollectorUid-pipelineUid] ON [dbo].[openCollectorsPipelines]
(
	[openCollectorUid] ASC,
	[pipelineUid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO


