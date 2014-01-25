

var ModuleObAdManager = new Object();

ModuleObAdManager.init_module = function()
{
  $('#obmenu-media').append('<li data-permissions="ad_manager_access"><a href="javascript: ModuleObAdManager.load();">Ad Manager</a></li>');
  $('#obmenu-admin').append('<li data-permissions="ad_manager_settings"><a href="javascript: ModuleObAdManager.load_settings();">Ad Manager Settings</a></li>');
}

ModuleObAdManager.load = function()
{

  api.post('obadmanager','get_settings',{},function(settings)
  {
    $('#layout_main').html(html.get('modules/ob_ad_manager/manager.html'));

    if(!settings.data.enabled || !settings.data.disabled)
    {
      $('#ob_ad_manager_messagebox').text('The ad manager does not seem to be configured properly.  Please set categories in "admin -> ad manager settings", or contact an administrator for assistance.').show();
      return;
    }

    api.post('obadmanager','get_schedule',{},function(response)
    {
      console.log(response);
    });
  });

}

ModuleObAdManager.load_settings = function()
{

  api.post('obadmanager','get_settings',{},function(response)
  {
    $('#layout_main').html(html.get('modules/ob_ad_manager/settings.html'));

    // fill category list
    for(var i in settings.categories)
    {
      $('#ob_ad_manager_enabled_category').append('<option value="'+settings.categories[i].id+'">'+htmlspecialchars(settings.categories[i].name)+'</option>');
      $('#ob_ad_manager_disabled_category').append('<option value="'+settings.categories[i].id+'">'+htmlspecialchars(settings.categories[i].name)+'</option>');
    }

    $('#ob_ad_manager_enabled_category').change(function() { ModuleObAdManager.settings_update_genre_list('enabled'); });
    $('#ob_ad_manager_disabled_category').change(function() { ModuleObAdManager.settings_update_genre_list('disabled'); });

    if(response.data.enabled) $('#ob_ad_manager_enabled_category').val(response.data.enabled.media_category_id);
    if(response.data.disabled) $('#ob_ad_manager_disabled_category').val(response.data.disabled.media_category_id);

    ModuleObAdManager.settings_update_genre_list('enabled');
    ModuleObAdManager.settings_update_genre_list('disabled');

    if(response.data.enabled) $('#ob_ad_manager_enabled_genre').val(response.data.enabled.id);
    if(response.data.disabled) $('#ob_ad_manager_disabled_genre').val(response.data.disabled.id);
  });

}

ModuleObAdManager.settings_update_genre_list = function(field)
{
  var selected_category = $('#ob_ad_manager_'+field+'_category').val();

  $('#ob_ad_manager_'+field+'_genre').find('option').remove();

  // fill genre list
  for(var i in settings.genres)
  {
    if(settings.genres[i].media_category_id == selected_category)
      $('#ob_ad_manager_'+field+'_genre').append('<option value="'+settings.genres[i].id+'">'+htmlspecialchars(settings.genres[i].name)+'</option>');
  }
}

ModuleObAdManager.save_settings = function()
{
  var enabled_id = $('#ob_ad_manager_enabled_genre').val();
  var disabled_id = $('#ob_ad_manager_disabled_genre').val();

  $('#ob_ad_manager_messagebox').hide();

  api.post('obadmanager','save_settings',{'enabled': enabled_id, 'disabled': disabled_id},function(response)
  {
    $('#ob_ad_manager_messagebox').text(response.msg).show();
  });
}


$(document).ready(function() {
	ModuleObAdManager.init_module();
});
