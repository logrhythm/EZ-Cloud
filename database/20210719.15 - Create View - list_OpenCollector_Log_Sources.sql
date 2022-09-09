-- Old name
DROP VIEW IF EXISTS [dbo].[list_OpenCollector_Log_Sources]
GO

-- New name
DROP VIEW IF EXISTS [dbo].[OC_Admin_List_OpenCollector_Log_Sources]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:      Tony Massé
-- Create date: 2021-07-19
-- Update date: 2022-08-03 - To add `EZ_VERSION` flag
-- EZ_VERSION: 20210719.01 :EZ_VERSION
-- =============================================
CREATE VIEW [dbo].[OC_Admin_List_OpenCollector_Log_Sources]
AS
	SELECT
		ls.MsgSourceID,
		ls.SystemMonitorID,
		ls.[Status],
		ls.MsgSourceTypeID,
		ls.[Name],
		ls.ShortDesc,
		ls.LongDesc,
		ls.IsVirtual,
		ls.DateUpdated,
		ls.HostID,
		h.[Name] AS 'HostName',
		ISNULL(
			(
				SELECT
					DISTINCT hi.[Value] AS 'value',
					hi.[Type] AS 'type'
					FROM [LogRhythmEMDB].[dbo].[HostIdentifier] hi
					WHERE hi.HostID = ls.HostID
					ORDER BY [Value]
					FOR JSON AUTO
			), '[]') AS 'HostIdentifiers_JSON'
		FROM [LogRhythmEMDB].[dbo].[MsgSource] ls WITH (INDEX = MsgSource_PK, NOLOCK) INNER JOIN
			[LogRhythmEMDB].[dbo].[Host] h WITH(NOLOCK) ON h.HostID = ls.HostID
		WHERE ls.MsgSourceTypeID = 1000759 -- "Syslog - Open Collector"
			AND ls.RecordStatus = 1
GO
