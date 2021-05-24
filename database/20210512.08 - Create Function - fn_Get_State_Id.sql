DROP FUNCTION IF EXISTS [dbo].[fn_Get_State_Id]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Tony Masse
-- Create date: 2021-05-12
-- Description:	Return the StateID for a given StateName
-- =============================================
CREATE FUNCTION fn_Get_State_Id 
(
	@stateName nvarchar(20)
)
RETURNS int
AS
BEGIN
	-- Declare the return variable here
	DECLARE @Result int

	-- Add the T-SQL statements to compute the return value here
	SELECT @Result = ISNULL((SELECT TOP 1 [id] FROM [dbo].[states] WHERE [name] = @stateName), 0)

	-- Return the result of the function
	RETURN @Result

END
GO

