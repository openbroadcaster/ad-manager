<?

class ObAdManagerModel extends OBFModel
{

  // get 'enabled' category. return false if category doesn't exist.
  public function get_enabled()
  {
    $cat = false;

    $this->db->where('name','ob_ad_manager_enabled_catid');
    $setting = $this->db->get_one('settings');

    // if category doesn't exist, set to false.
    if($setting)
    {
      $this->db->where('id',$setting['value']);
      $cat = $this->db->get_one('media_genres');
    }

    return $cat;
  }

  // get 'disabled' category. return false if category doesn't exist.
  public function get_disabled()
  {
    $cat = false;

    $this->db->where('name','ob_ad_manager_disabled_catid');
    $setting = $this->db->get_one('settings');

    // if category doesn't exist, set to false.
    if($setting)
    {
      $this->db->where('id',$setting['value']);
      $cat = $this->db->get_one('media_genres');
    }

    return $cat;
  }

  // set 'enabled' category.
  public function set_enabled($id)
  {
    $this->db->where('name','ob_ad_manager_enabled_catid');
    $setting = $this->db->get_one('settings');

    if($setting)
    {
      $this->db->where('id',$setting['id']);
      $this->db->update('settings',array('value'=>$id));
    }
    else $this->db->insert('settings',array('name'=>'ob_ad_manager_enabled_catid','value'=>$id));
  }

  // set 'disabled' category.
  public function set_disabled($id)
  {
    $this->db->where('name','ob_ad_manager_disabled_catid');
    $setting = $this->db->get_one('settings');

    if($setting)
    {
      $this->db->where('id',$setting['id']);
      $this->db->update('settings',array('value'=>$id));
    }
    else $this->db->insert('settings',array('name'=>'ob_ad_manager_disabled_catid','value'=>$id));
  }

  // adjust media into appropriate categories.
  public function adjust_media()
  {
    // TODO
  }

}
