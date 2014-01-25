<?

class ObAdManager extends OBFController
{

	public function __construct()
	{
		parent::__construct();
		$this->user->require_authenticated();
    $this->model = $this->load->model('ObAdManager');
	}

	public function get_settings()
	{
    $this->user->require_permission('ad_manager_settings or ad_manager_access');
    return array(true,'Category settings.',array('enabled'=>$this->model->get_enabled(),'disabled'=>$this->model->get_disabled()));
	}

  public function save_settings()
  {
    $this->user->require_permission('ad_manager_settings');

    $enabled_id = $this->data('enabled');
    $disabled_id = $this->data('disabled');

    if(!$this->db->id_exists('media_genres',$enabled_id) || !$this->db->id_exists('media_genres',$disabled_id))
      return array(false,'One of the selected categories does not seem to be valid.  Please refresh OpenBroadcaster and try again.');

    if($enabled_id == $disabled_id) 
      return array(false,'The enabled and disabled categories cannot be the same.');

    $this->model->set_enabled($enabled_id);
    $this->model->set_disabled($disabled_id);
    $this->model->adjust_media();

    return array(true,'Settings saved.');
  }

  public function get_schedule()
  {
    $this->user->require_permission('ad_manager_access');

    return array(true,'Ad manager schedule.',array(1,2,3));
  }

  

}
