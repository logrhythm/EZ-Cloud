-- =============================================
-- Author:		Tony Massé
-- Create date: 2021-04-30
-- Update date: 2021-11-22 - To be runnable multiple times and ignore unnecessary tasks
-- =============================================
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('[states]', 'U') IS NULL
BEGIN
	CREATE TABLE [dbo].[states](
		[id] [tinyint] NOT NULL,
		[name] [nvarchar](50) NOT NULL,
	CONSTRAINT [PK_states] PRIMARY KEY CLUSTERED 
	(
		[id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]
END
ELSE
BEGIN
	PRINT CONVERT(nvarchar(24), GETDATE(), 121) + ' | INFO: [states] already exists. Moving on.'
END
GO

DROP INDEX IF EXISTS [IX_states_name] ON [dbo].[states]
GO

CREATE NONCLUSTERED INDEX [IX_states_name] ON [dbo].[states]
(
	[name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO


IF NOT EXISTS (SELECT *
    FROM [dbo].[states]
    WHERE [id] = 0)
	INSERT [dbo].[states] ([id], [name]) VALUES (0, N'Disabled')
GO
IF NOT EXISTS (SELECT *
    FROM [dbo].[states]
    WHERE [id] = 1)
	INSERT [dbo].[states] ([id], [name]) VALUES (1, N'Enabled')
GO
IF NOT EXISTS (SELECT *
    FROM [dbo].[states]
    WHERE [id] = 2)
	INSERT [dbo].[states] ([id], [name]) VALUES (2, N'New')
GO
IF NOT EXISTS (SELECT *
    FROM [dbo].[states]
    WHERE [id] = 3)
	INSERT [dbo].[states] ([id], [name]) VALUES (3, N'Dev')
GO
IF NOT EXISTS (SELECT *
    FROM [dbo].[states]
    WHERE [id] = 4)
	INSERT [dbo].[states] ([id], [name]) VALUES (4, N'Ready')
GO
IF NOT EXISTS (SELECT *
    FROM [dbo].[states]
    WHERE [id] = 5)
	INSERT [dbo].[states] ([id], [name]) VALUES (5, N'Locked')
GO
IF NOT EXISTS (SELECT *
    FROM [dbo].[states]
    WHERE [id] = 6)
	INSERT [dbo].[states] ([id], [name]) VALUES (6, N'Absent')
GO
IF NOT EXISTS (SELECT *
    FROM [dbo].[states]
    WHERE [id] = 7)
	INSERT [dbo].[states] ([id], [name]) VALUES (7, N'Installed')
GO
IF NOT EXISTS (SELECT *
    FROM [dbo].[states]
    WHERE [id] = 8)
	INSERT [dbo].[states] ([id], [name]) VALUES (8, N'Running')
GO
