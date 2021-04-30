/****** Object:  Table [dbo].[states]    Script Date: 30/04/2021 11:52:34 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[states](
	[id] [tinyint] NOT NULL,
	[name] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_states] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

DROP INDEX IF EXISTS [IX_states_name] ON [dbo].[states]
GO

CREATE NONCLUSTERED INDEX [IX_states_name] ON [dbo].[states]
(
	[name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO


INSERT [dbo].[states] ([id], [name]) VALUES (0, N'Disabled')
GO
INSERT [dbo].[states] ([id], [name]) VALUES (1, N'Enabled')
GO
INSERT [dbo].[states] ([id], [name]) VALUES (2, N'New')
GO
INSERT [dbo].[states] ([id], [name]) VALUES (3, N'Dev')
GO
INSERT [dbo].[states] ([id], [name]) VALUES (4, N'Ready')
GO
INSERT [dbo].[states] ([id], [name]) VALUES (5, N'Locked')
GO
INSERT [dbo].[states] ([id], [name]) VALUES (6, N'Absent')
GO
INSERT [dbo].[states] ([id], [name]) VALUES (7, N'Installed')
GO
INSERT [dbo].[states] ([id], [name]) VALUES (8, N'Running')
GO
