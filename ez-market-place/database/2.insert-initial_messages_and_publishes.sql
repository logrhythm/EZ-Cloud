-- Add the initial entries in Messages and Publishers
-- This can be run multiple times safely

-- Default Message
INSERT IGNORE 
    INTO 
        `messages` (`uid`, `sent_On`, `updated_On`, `recipient_Uid`, `sender_Uid`, `status`, `message`, `flags`)
    VALUES 
        ('361670bc-8c29-11ec-88fe-00155d005a03', '2022-02-12 17:28:00', '2022-02-14 16:16:16', NULL, NULL, 5, 'Welcome to the EZ Cloud Market Place.', '[]');


-- Default Publishers
-- INSERT IGNORE
--     INTO `publishers` (`uid`, `display_name`) VALUES 
--         ('3dd874fe-cb07-4cf1-b79d-cc45fd7d23d5', 'Anonymous'),
--         ('1ed06be7-7a9e-4409-8c0c-b33fb0be2d67', 'EZ Market Admin');
