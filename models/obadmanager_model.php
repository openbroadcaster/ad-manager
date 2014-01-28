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

  // get 'timezone' setting. return false if timezone setting doesn't exist.
  public function get_timezone()
  {
    $this->db->where('name','ob_ad_manager_timezone');
    $setting = $this->db->get_one('settings');

    // if category doesn't exist, set to false.
    if($setting) return $setting['value'];
    else return false;
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

  // set timezone setting
  public function set_timezone($tz)
  {
    $this->db->where('name','ob_ad_manager_timezone');
    $setting = $this->db->get_one('settings');

    if($setting)
    {
      $this->db->where('id',$setting['id']);
      $this->db->update('settings',array('value'=>$tz));
    }
    else $this->db->insert('settings',array('name'=>'ob_ad_manager_timezone','value'=>$tz));
  }

  public function validate_settings($enabled_id, $disabled_id, $tz)
  {
    try 
    {
      $tz_test = new DateTimeZone($tz);
    }
    catch(Exception $e)
    {
      $tz_test = false;
    }

    if(!$tz_test) return array(false,'There was an error setting the timezone.');

    if(!$this->db->id_exists('media_genres',$enabled_id) || !$this->db->id_exists('media_genres',$disabled_id))
      return array(false,'One of the selected categories does not seem to be valid.  Please refresh OpenBroadcaster and try again.');

    if($enabled_id == $disabled_id) 
      return array(false,'The enabled and disabled categories cannot be the same.');

    return array(true,'Settings are valid.');
  }

  public function validate_item($data,$id=false)
  {

    if(!$this->get_timezone()) return array(false,'Cannot save this item as the ad manager timezone is not properly configured.');

    // required fields?
    if( empty($data['start_date']) || 
        empty($data['start_time']) ||
        empty($data['stop_date']) ||
        empty($data['stop_time'])) return array(false,'One or more required fields were not filled.');

    // check if ID is valid (if editing)
    if($id!==false) 
    {
      if(!$this->db->id_exists('ob_ad_manager',$id)) return array(false,'The item you are attempting to edit does not appear to exist.');
    }

    // check if media ID is valid
    if(empty($data['item_id'])) return array(false,'This media item is invalid.');

    $this->db->where('id',$data['item_id']);
    $media = $this->db->get_one('media');
    if(!$media) return array(false,'This media item does not appear to exist.');
    if($media['is_approved']==0) return array(false,'Media must be approved.');
    if($media['is_archived']==1) return array(false,'Media must not be archived.');

    // is start/stop valid?
    $date = array();
    $date['start'] = explode('-',$data['start_date']);
    $date['stop'] = explode('-',$data['stop_date']);

    $time = array();
    $time['start'] = explode(':',$data['start_time']);
    $time['stop'] = explode(':',$data['stop_time']);

    foreach($date as $index=>$val)
    {
      if(count($val)!=3 || !checkdate($val[1],$val[2],$val[0])) return array(false,ucwords($index).' date is not valid.');
    }

    foreach($time as $index=>$val)
    {
      if(count($val)!=3 || !preg_match('/^[0-9]{2}$/',$val[0]) || !preg_match('/^[0-9]{2}$/',$val[1]) || !preg_match('/^[0-9]{2}$/',$val[2]) || 
            $val[0]>23 || $val[1]>59 || $val[2]>59) return array(false,ucwords($indeX).' time is not valid.');
    }

    if($this->datetime_to_timestamp($data['start_date'],$data['start_time']) >= $this->datetime_to_timestamp($data['stop_date'],$data['stop_time']))
      return array(false,'The start date/time must be before the stop date/time.');

    $now = new Datetime('now', new DateTimeZone($this->get_timezone()));

    //if($this->datetime_to_timestamp($data['stop_date'],$data['stop_time']) <= $now->getTimestamp())
    //  return array(false,'The stop date/time has already passed.');

    return array(true,'Item is valid.');

  }

  public function get_items()
  {
    $media_model = $this->load->model('media');

    $now = time();

    $this->db->where('timestamp_disable',$now,'<');
    $expired = $this->db->get('ob_ad_manager');

    $this->db->where('timestamp_enable',$now,'<=');
    $this->db->where('timestamp_disable',$now,'>');
    $current = $this->db->get('ob_ad_manager');
  
    $this->db->where('timestamp_enable',$now,'>');
    $upcoming = $this->db->get('ob_ad_manager');

    $items = array('expired'=>$expired,'current'=>$current,'upcoming'=>$upcoming);
  
    foreach($items as $type=>$tmp)
      foreach($tmp as $index=>$item)
      {
        $datetime = $this->timestamp_to_datetime($item['timestamp_enable']);
        $items[$type][$index]['start_date'] = $datetime[0];
        $items[$type][$index]['start_time'] = $datetime[1];

        $datetime = $this->timestamp_to_datetime($item['timestamp_disable']);
        $items[$type][$index]['stop_date'] = $datetime[0];
        $items[$type][$index]['stop_time'] = $datetime[1];

        $media = $media_model('get_by_id',$item['media_id']);
        $items[$type][$index]['media_artist'] = $media['artist'];
        $items[$type][$index]['media_title'] = $media['title'];
      }

    return $items;
  }

  public function save_item($data,$id=false)
  {
    
    $row = array();
    $row['media_id'] = $data['item_id'];
    $row['notes'] = $data['notes'];
    $row['timestamp_enable'] = $this->datetime_to_timestamp($data['start_date'], $data['start_time']);
    $row['timestamp_disable'] = $this->datetime_to_timestamp($data['stop_date'], $data['stop_time']);

    if($id)
    {
      $this->db->where('id',$id);
      $this->db->update('ob_ad_manager',$row);
    }
    else $this->db->insert('ob_ad_manager',$row);

    return array(true,'Item saved.');
  }

  public function delete_item($id)
  {
    $this->db->where('id',$id);
    $this->db->delete('ob_ad_manager');
  }

  private function datetime_to_timestamp($date,$time)
  {
    $timezone = $this->get_timezone();
    if(!$timezone) return false;

    $datetime = new DateTime($date.' '.$time, new DateTimeZone($timezone));

    if(!$datetime) return false;

    return $datetime->getTimestamp();
  }

  private function timestamp_to_datetime($timestamp)
  {
    $datetime = new DateTime('@'.$timestamp, new DateTimeZone('UTC'));
    $datetime->setTimezone(new DateTimeZone($this->get_timezone()));

    $date = $datetime->format('Y-m-d');
    $time = $datetime->format('H:i:s');

    return array($date,$time);
  }

  // adjust media into appropriate categories.
  public function adjust_media()
  {

    $media_model = $this->load->model('media');

    $timezone = $this('get_timezone');
    $enabled = $this('get_enabled');
    $disabled = $this('get_disabled');

    if(!$timezone || !$enabled || !$disabled) return false; // we need these things.

    $enabled = $enabled['id'];
    $disabled = $disabled['id'];

    $now = time();

    $items = $this('get_items');

    $enabled_media = array();

    // check media that should be in enabled category. enable if necessary.
    foreach($items['current'] as $item)
    {

      $enabled_media[] = $item['media_id'];

      $media = $media_model('get_by_id',$item['media_id']);
      if(!$media) continue;

      if($media['genre_id']!=$enabled)
      {
        $this->db->where('id',$media['id']);
        $this->db->update('media',array('genre_id'=>$enabled));
      }
    }

    // move to disabled category any media that doesn't belong in enabled category.
    $this->db->where('genre_id',$enabled);
    $medias = $this->db->get('media');

    foreach($medias as $media)
    {
      if(array_search($media['id'],$enabled_media)===false)
      {
        $this->db->where('id',$media['id']);
        $this->db->update('media',array('genre_id'=>$disabled));
      }
    }

  }

}
