<?php

class ObAdManagerModule extends OBFModule
{

  public $name = 'Ad Manager v1.0';
  public $description = 'Schedule ads to start and stop by moving them between "enabled" and "disabled" categories.';

  public function callbacks()
  {
    $this->callback_handler->register_callback('ObAdManager.media_archive_callback','Media.archive','return',0);
  }

  public function install()
  {
  
    $this->db->query('CREATE TABLE IF NOT EXISTS `ob_ad_manager` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `media_id` int(10) unsigned NOT NULL,
  `timestamp_enable` int(10) unsigned NOT NULL,
  `timestamp_disable` int(10) unsigned NOT NULL,
  `notes` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=8 ;');

    $this->db->query('INSERT INTO `users_permissions` (`id`, `name`, `description`, `category`) 
      VALUES (NULL, \'ad_manager_access\', \'Manage Ads\', \'OB Ad Manager\'), (NULL, \'ad_manager_settings\', 
      \'Modify Settings\', \'OB Ad Manager\');');

    return true;

  }

  public function uninstall()
  {
    $this->db->query('DELETE FROM `users_permissions` WHERE category = \'OB Ad Manager\'');
    return true;
  }

}
