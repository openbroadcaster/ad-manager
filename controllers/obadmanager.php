<?

class ObAdManager extends OBFController
{

  public function __construct()
  {
    parent::__construct();
    // $this->user->require_authenticated();
    $this->model = $this->load->model('ObAdManager');
  }

  public function get_settings()
  {
    $this->user->require_permission('ad_manager_settings or ad_manager_access');
    return array(true,'Category settings.',array('enabled'=>$this->model->get_enabled(),'disabled'=>$this->model->get_disabled(),'timezone'=>$this->model->get_timezone()));
  }

  public function save_settings()
  {
    $this->user->require_permission('ad_manager_settings');

    $enabled_id = $this->data('enabled');
    $disabled_id = $this->data('disabled');
    $timezone = $this->data('timezone');
    $devices_clear_cache = $this->data('devices_clear_cache');

    $validation = $this->model('validate_settings',$enabled_id,$disabled_id,$timezone,$devices_clear_cache);

    if($validation[0]==false) return $validation;

    $this->model('set_enabled',$enabled_id);
    $this->model('set_disabled',$disabled_id);
    $this->model('set_timezone',$timezone);
    $this->model('set_devices_clear_cache',$devices_clear_cache);
    $this->model('adjust_media');

    return array(true,'Settings saved.');
  }

  public function get_items()
  {
    $this->user->require_permission('ad_manager_access');
    return array(true,'Ad manager schedule.',$this->model('get_items'));
  }

  public function save_item()
  {
    $this->user->require_permission('ad_manager_access');

    $data = array();
    $data['start_date'] = trim($this->data('start_date'));
    $data['start_time'] = trim($this->data('start_time'));
    $data['stop_date'] = trim($this->data('stop_date'));
    $data['stop_time'] = trim($this->data('stop_time'));
    $data['notes'] = trim($this->data('notes'));
    $data['item_id'] = trim($this->data('item_id'));

    $id = $this->data('id');
    if(empty($id)) $id = false;
    
    $validate = $this->model('validate_item',$data,$id);
    if(!$validate[0]) return $validate;

    $this->model('save_item',$data,$id);
    $this->model('adjust_media');

    return array(true,'Item saved.');
  }

  public function delete_item()
  {
    $this->user->require_permission('ad_manager_access');
    $id = $this->data('id');
    if(!empty($id)) $this->model('delete_item',$id);

    $this->model('adjust_media');

    return array(true,'Item deleted.');
  }

  public function adjust_media()
  {
    $this->model('adjust_media');
    return array(true,'Media adjusted.');
  }

  // if media is archived, remove from ad manager.
  public function media_archive_callback($hook,$position)
  {
    $ids = $this->data('id');
  
    // if we just have a single ID, make it into an array so we can proceed on that assumption.
    if(!is_array($ids)) $ids = array($ids);

    foreach($ids as $id)
    {
      $this->db->where('media_id',$id);
      $this->db->delete('ob_ad_manager');
    }
  }
  
}
