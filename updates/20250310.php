<?php

class ObAdManagerUpdate20250310 extends OBUpdate
{
    public function items()
    {
        $updates = ['Foreign key constraint on selected media items.'];

        return $updates;
    }

    public function run()
    {
        $this->db->query("ALTER TABLE ob_ad_manager ENGINE=InnoDB;");
        if ($this->db->error()) {
            echo 'Failed to convert ob_ad_manager table to InnoDB, needed for foreign keys.';
            return false;
        }

        $this->db->query("ALTER TABLE ob_ad_manager ADD FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;");
        if ($this->db->error()) {
            echo 'Failed to add foreign key to ob_ad_manager table.';
            return false;
        }

        return true;
    }
}
