/****** Object:  Table [dbo].[logSamples]    Script Date: 30/04/2021 12:03:16 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[logSamples](
	[uid] [varchar](40) NOT NULL,
	[pipelineUid] [varchar](40) NULL,
	[name] [nvarchar](250) NULL,
 CONSTRAINT [PK_logSamples] PRIMARY KEY CLUSTERED 
(
	[uid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

ALTER TABLE [dbo].[logSamples] ADD  CONSTRAINT [DF_logSamples_name]  DEFAULT (N'No name') FOR [name]
GO


