USE [EZ]
GO

DECLARE @uid varchar(40) = '92b5c269-25db-4ea2-97c2-9112c160a309'
DECLARE @name nvarchar(50) = 'jsBeat - Flat file - EZ Test'
DECLARE @MPEPolicy_Name varchar(50) = 'LogRhythm Default'

-- TODO: Set parameter values here.

EXECUTE [dbo].[upsert_Processing_Policy] 
   @uid
  ,@name
  ,@MPEPolicy_Name
GO