/****** Object:  Table [dbo].[openCollectors]    Script Date: 30/04/2021 11:46:59 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[openCollectors](
	[uid] [varchar](40) NOT NULL,
	[name] [nvarchar](50) NULL,
	[hostname] [nvarchar](50) NULL,
	[port] [int] NULL,
	[authenticationMethod] [nvarchar](15) NULL,
	[username] [nvarchar](100) NULL,
	[password] [nvarchar](250) NULL,
	[privateKey] [nvarchar](max) NULL,
	[osVersion] [nvarchar](100) NULL,
	[ocInstalled] [tinyint] NULL,
	[ocVersion] [nvarchar](100) NULL,
	[fbInstalled] [tinyint] NULL,
	[fbVersion] [nvarchar](100) NULL,
 CONSTRAINT [PK_openCollectors] PRIMARY KEY CLUSTERED 
(
	[uid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

ALTER TABLE [dbo].[openCollectors] ADD  CONSTRAINT [DF_openCollectors_ocInstalled]  DEFAULT ((0)) FOR [ocInstalled]
GO

ALTER TABLE [dbo].[openCollectors] ADD  CONSTRAINT [DF_openCollectors_fbInstalled]  DEFAULT ((0)) FOR [fbInstalled]
GO
