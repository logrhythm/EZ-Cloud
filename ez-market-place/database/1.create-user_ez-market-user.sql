-- Create the `ez-market-user` user with its password
-- DO NOT RE-RUN

CREATE USER 'ez-market-user'@'localhost' IDENTIFIED BY 'Shhhhhhhh....';
GRANT USAGE ON *.* TO 'ez-market-user'@'localhost';
GRANT SELECT, EXECUTE, SHOW VIEW, CREATE TEMPORARY TABLES, INSERT, TRIGGER, UPDATE  ON `ez-market-place`.* TO 'ez-market-user'@'localhost';
