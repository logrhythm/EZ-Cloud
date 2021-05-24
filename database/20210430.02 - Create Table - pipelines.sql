/****** Object:  Table [dbo].[pipelines]    Script Date: 30/04/2021 11:50:45 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[pipelines](
	[uid] [varchar](40) NOT NULL,
	[name] [nvarchar](50) NULL,
	[status] [tinyint] NOT NULL,
	[primaryOpenCollector] [varchar](40) NULL,
	[fieldsMappingJson] [nvarchar](max) NULL,
	[collectionConfigJson] [nvarchar](max) NULL,
 CONSTRAINT [PK_pipelines] PRIMARY KEY CLUSTERED 
(
	[uid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

