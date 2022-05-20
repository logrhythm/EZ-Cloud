/****** Object:  Table [dbo].[openCollectors]    Script Date: 30/04/2021 11:46:59 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Tony Massé
-- Create date: 2021-04-30
-- Update date: 2021-08-09 - To deal with multiple Shippers and their versions
-- Update date: 2021-11-22 - To be runnable multiple times and ignore unnecessary tasks
-- =============================================
IF OBJECT_ID('[openCollectors]', 'U') IS NULL
BEGIN
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
		[installedShippers] [nvarchar](max) NOT NULL
	CONSTRAINT [PK_openCollectors] PRIMARY KEY CLUSTERED 
	(
		[uid] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

	ALTER TABLE [dbo].[openCollectors] ADD  CONSTRAINT [DF_openCollectors_ocInstalled]  DEFAULT ((0)) FOR [ocInstalled]

	ALTER TABLE [dbo].[openCollectors] ADD  CONSTRAINT [DF_openCollectors_fbInstalled]  DEFAULT ((0)) FOR [fbInstalled]

	ALTER TABLE [dbo].[openCollectors] ADD  CONSTRAINT [DF_openCollectors_installedShippers]  DEFAULT ('[]') FOR [installedShippers]
END
ELSE
BEGIN
	PRINT CONVERT(nvarchar(24), GETDATE(), 121) + ' | INFO: [openCollectors] already exists. Moving on.'
END
GO
