CREATE DATABASE [EZ]
 CONTAINMENT = NONE
 COLLATE SQL_Latin1_General_CP1_CI_AS
GO
ALTER DATABASE [EZ] SET COMPATIBILITY_LEVEL = 130
GO
ALTER DATABASE [EZ] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [EZ] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [EZ] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [EZ] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [EZ] SET ARITHABORT OFF 
GO
ALTER DATABASE [EZ] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [EZ] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [EZ] SET AUTO_CREATE_STATISTICS ON(INCREMENTAL = OFF)
GO
ALTER DATABASE [EZ] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [EZ] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [EZ] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [EZ] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [EZ] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [EZ] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [EZ] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [EZ] SET  DISABLE_BROKER 
GO
ALTER DATABASE [EZ] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [EZ] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [EZ] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [EZ] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [EZ] SET  READ_WRITE 
GO
ALTER DATABASE [EZ] SET RECOVERY FULL 
GO
ALTER DATABASE [EZ] SET  MULTI_USER 
GO
ALTER DATABASE [EZ] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [EZ] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [EZ] SET DELAYED_DURABILITY = DISABLED 
GO
USE [EZ]
GO
ALTER DATABASE SCOPED CONFIGURATION SET MAXDOP = 0;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET MAXDOP = PRIMARY;
GO
ALTER DATABASE SCOPED CONFIGURATION SET LEGACY_CARDINALITY_ESTIMATION = OFF;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET LEGACY_CARDINALITY_ESTIMATION = PRIMARY;
GO
ALTER DATABASE SCOPED CONFIGURATION SET PARAMETER_SNIFFING = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET PARAMETER_SNIFFING = PRIMARY;
GO
ALTER DATABASE SCOPED CONFIGURATION SET QUERY_OPTIMIZER_HOTFIXES = OFF;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET QUERY_OPTIMIZER_HOTFIXES = PRIMARY;
GO
USE [EZ]
GO
IF NOT EXISTS (SELECT name FROM sys.filegroups WHERE is_default=1 AND name = N'PRIMARY') ALTER DATABASE [EZ] MODIFY FILEGROUP [PRIMARY] DEFAULT
GO