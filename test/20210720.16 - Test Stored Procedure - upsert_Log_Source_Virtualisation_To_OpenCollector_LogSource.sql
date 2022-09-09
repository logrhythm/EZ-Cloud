DECLARE @RC int
DECLARE @uid varchar(40) = '92b5c269-25db-4ea2-97c2-9112c160a309' 
DECLARE @OpenCollectorMotherLogSourceID int = 13

EXECUTE @RC = [dbo].[OC_Admin_Upsert_Log_Source_Virtualisation_To_OpenCollector_LogSource] 
   @uid
  ,@OpenCollectorMotherLogSourceID


/* -- First run:
UpdatedOpenCollectorLogSourceID	UpsertedVirtualLogSourceID	NewCommentID
13	27	50
*/

EXECUTE @RC = [dbo].[OC_Admin_Upsert_Log_Source_Virtualisation_To_OpenCollector_LogSource] 
   @uid
  ,@OpenCollectorMotherLogSourceID

/* -- Second run:
Error
Virtualised Log Source named "LRVM6 Open Collector-jsBeat - Flat file - EZ Test" already defined for UID: "92b5c269-25db-4ea2-97c2-9112c160a309". Doing nothing.
*/
