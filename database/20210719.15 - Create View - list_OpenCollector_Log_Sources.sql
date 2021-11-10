DROP VIEW IF EXISTS [dbo].[list_OpenCollector_Log_Sources]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[list_OpenCollector_Log_Sources]
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
