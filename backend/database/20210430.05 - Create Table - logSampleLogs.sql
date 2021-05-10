/****** Object:  Table [dbo].[logSampleLogs]    Script Date: 30/04/2021 12:34:50 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[logSampleLogs](
	[logSampleUid] [varchar](40) NOT NULL,
	[text] [nvarchar](max) NOT NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

DROP INDEX IF EXISTS [IX_logSampleLogs-logSampleUid] ON [dbo].[logSampleLogs] WITH ( ONLINE = OFF )
GO

CREATE CLUSTERED INDEX [IX_logSampleLogs-logSampleUid] ON [dbo].[logSampleLogs]
(
	[logSampleUid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO


