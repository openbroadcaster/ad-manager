OBModules.ObAdManager = new Object();

/* Manager Page */

OBModules.ObAdManager.init = function()
{
  OB.Callbacks.add('ready',0,OBModules.ObAdManager.init_menu);
}

OBModules.ObAdManager.init_menu = function()
{
  OB.UI.addSubMenuItem('media','Ad Manager','obadmanager',OBModules.ObAdManager.load,20,'ad_manager_access');
  OB.UI.addSubMenuItem('admin','Ad Manager Settings','obadmanager',OBModules.ObAdManager.load_settings,20,'ad_manager_settings');
}

OBModules.ObAdManager.load = function()
{

  OB.API.post('obadmanager','get_settings',{},function(settings)
  {
    OB.UI.replaceMain('modules/ob_ad_manager/manager.html');

    if(!settings.data.enabled || !settings.data.disabled || !settings.data.timezone)
    {
      $('#ob_ad_manager_message').obWidget('error','The ad manager does not seem to be configured properly.  Please adjust settings in "admin -> ad manager settings", or contact an administrator for assistance.').show();
      return;
    }

    $('#ob_ad_manager').show();

    $('#ob_ad_manager_drop').droppable({
      drop: function(event, ui) {

        if($(ui.draggable).attr('data-mode')!='media') { alert('Only media items are supported.'); return; }

        if($('.sidebar_search_media_selected').length!=1) { alert('You can manage only one media item at a time.'); return; }

        var item_id = $('.sidebar_search_media_selected').first().attr('data-id');
        var item_name = $('.sidebar_search_media_selected').first().attr('data-artist')+' - '+$('.sidebar_search_media_selected').first().attr('data-title');
        var item_type = $('.sidebar_search_media_selected').first().attr('data-type');

        OBModules.ObAdManager.add_item(item_id,item_name,item_type);

      }
    });

    OBModules.ObAdManager.get_items();

  });
}

OBModules.ObAdManager.get_items = function()
{

  OB.API.post('obadmanager','get_items',{},function(response)
  {
    if(!response.status) return;

    OBModules.ObAdManager.items_cache = {};

    $('#ob_ad_manager_expired tbody').remove();
    $('#ob_ad_manager_current tbody').remove();
    $('#ob_ad_manager_upcoming tbody').remove();

    $('#ob_ad_manager_expired').append(OBModules.ObAdManager.tbody_html(response.data.expired));
    $('#ob_ad_manager_current').append(OBModules.ObAdManager.tbody_html(response.data.current));
    $('#ob_ad_manager_upcoming').append(OBModules.ObAdManager.tbody_html(response.data.upcoming));

    if(!$('#ob_ad_manager_expired tbody').length) $('#ob_ad_manager_expired').append('<tbody><tr><td colspan="4">No ads found.</td></tr></tbody>');
    if(!$('#ob_ad_manager_current tbody').length) $('#ob_ad_manager_current').append('<tbody><tr><td colspan="4">No ads found.</td></tr></tbody>');
    if(!$('#ob_ad_manager_upcoming tbody').length) $('#ob_ad_manager_upcoming').append('<tbody><tr><td colspan="4">No ads found.</td></tr></tbody>');

    $('#ob_ad_manager table tr.ad_item').dblclick(OBModules.ObAdManager.edit_item);
  });

}

OBModules.ObAdManager.tbody_html = function(items)
{
  if(items.length<1) return '';

  $tbody = $('<tbody></tbody>');

  $.each(items, function(index,item)
  {
    var $tr = $('<tr></tr>');
    $tr.append('<td class="ob_ad_manager_media">'+htmlspecialchars(item.media_artist+' - '+item.media_title)+'</td>');
    $tr.append('<td class="ob_ad_manager_start">'+item.start_date+' '+item.start_time+'</td>');
    $tr.append('<td class="ob_ad_manager_stop">'+item.stop_date+' '+item.stop_time+'</td>');
    $tr.append('<td>'+htmlspecialchars(item.notes)+'</td>');
    $tbody.append('<tr class="ad_item" data-id="'+item.id+'">'+$tr.html()+'</tr>');

    OBModules.ObAdManager.items_cache[item.id] = item;
  }); 

  return '<tbody>'+$tbody.html()+'</tbody>';
}

OBModules.ObAdManager.edit_item = function()
{
  var item = OBModules.ObAdManager.items_cache[$(this).attr('data-id')];

  console.log(item);

  OBModules.ObAdManager.addedit_window();

  $('#ob_ad_manager_start_date').val(item.start_date);
  $('#ob_ad_manager_start_time').val(item.start_time);
  $('#ob_ad_manager_stop_date').val(item.stop_date);
  $('#ob_ad_manager_stop_time').val(item.stop_time);
  $('#ob_ad_manager_item_id').val(item.media_id);
  $('#ob_ad_manager_id').val(item.id);

  $('#ob_ad_manager_item_info').text(item.media_artist+' - '+item.media_title+' (media #'+item.id+')');

  $('#ob_ad_manager_notes').val(item.notes);
}

OBModules.ObAdManager.add_item = function(item_id,item_name,item_type)
{

  this.addedit_window();

  $('#DOMWindow').find('.edit_only').hide();

  $('#ob_ad_manager_item_id').val(item_id);
  $('#ob_ad_manager_item_info').text(item_name+' (media #'+item_id+')');

}

OBModules.ObAdManager.save_item = function()
{

  fields = new Object();

  fields.notes = $('#ob_ad_manager_notes').val();

  fields.start_date = $('#ob_ad_manager_start_date').val();
  fields.start_time = $('#ob_ad_manager_start_time').val();

  fields.stop_date = $('#ob_ad_manager_stop_date').val();
  fields.stop_time = $('#ob_ad_manager_stop_time').val();

  fields.id = $('#ob_ad_manager_id').val();
  fields.item_id = $('#ob_ad_manager_item_id').val();

  OB.API.post('obadmanager','save_item',fields,function(data) 
  {

    if(data.status==false)
    {
      $('#ob_ad_manager_addedit_message').obWidget('error',data.msg);
    }

    else
    {
      OB.UI.closeModalWindow();
      OBModules.ObAdManager.get_items();
    }

  });

}

OBModules.ObAdManager.addedit_window = function()
{

  OB.UI.openModalWindow('modules/ob_ad_manager/manager_addedit.html');

  // friendly date picker
  $('#ob_ad_manager_start_date').datepicker({ dateFormat: "yy-mm-dd" });
  $('#ob_ad_manager_stop_date').datepicker({ dateFormat: "yy-mm-dd" });

  // friendly time picker
  $('#ob_ad_manager_start_time').timepicker({timeFormat: 'hh:mm:ss',showSecond: true});
  $('#ob_ad_manager_stop_time').timepicker({timeFormat: 'hh:mm:ss',showSecond: true});

  // set to current time (start), one week ahead (stop)
  var date = new Date();
  $('#ob_ad_manager_start_date').datepicker('setDate','+0');
  $('#ob_ad_manager_stop_date').datepicker('setDate','+7');

  var hour = ""+(date.getHours()+1);
  if(hour.length==1) hour = "0"+hour;

  $('#ob_ad_manager_start_time').val(hour+':00:00');
  $('#ob_ad_manager_stop_time').val(hour+':00:00');

}

OBModules.ObAdManager.delete_item = function(confirm)
{
  if(confirm)
  {
    OB.API.post('obadmanager','delete_item',{ 'id': $('#ob_ad_manager_id').val() }, function(data)
    {
      if(data.status==true)
      {
        OB.UI.closeModalWindow();
        OBModules.ObAdManager.get_items();
      }

      else
      {
        $('#ob_ad_manager_addedit_message').obWidget('error',data.msg);
      }
    });

  }

  else
  {
    OB.UI.confirm('Delete this item?',function() { OBModules.ObAdManager.delete_item(true); }, 'Yes, Delete', 'No, Cancel', 'delete');
  }
}






/* Settings Page */

OBModules.ObAdManager.load_settings = function()
{

  OB.API.post('obadmanager','get_settings',{},function(response)     
  { 
    OB.API.post('device','device_list', {}, function(devices_response)
    {

      var devices = devices_response.data;

      OB.UI.replaceMain('modules/ob_ad_manager/settings.html');
      $('#ob_ad_manager_timezone').html(OB.UI.getHTML('device/tzoptions.html'));

      // fill category list
      for(var i in OB.Settings.categories)
      {
        $('#ob_ad_manager_enabled_category').append('<option value="'+OB.Settings.categories[i].id+'">'+htmlspecialchars(OB.Settings.categories[i].name)+'</option>');
        $('#ob_ad_manager_disabled_category').append('<option value="'+OB.Settings.categories[i].id+'">'+htmlspecialchars(OB.Settings.categories[i].name)+'</option>');
      }

      $('#ob_ad_manager_enabled_category').change(function() { OBModules.ObAdManager.settings_update_genre_list('enabled'); });
      $('#ob_ad_manager_disabled_category').change(function() { OBModules.ObAdManager.settings_update_genre_list('disabled'); });

      if(response.data.timezone) $('#ob_ad_manager_timezone').val(response.data.timezone);
      if(response.data.enabled) $('#ob_ad_manager_enabled_category').val(response.data.enabled.media_category_id);
      if(response.data.disabled) $('#ob_ad_manager_disabled_category').val(response.data.disabled.media_category_id);

      OBModules.ObAdManager.settings_update_genre_list('enabled');
      OBModules.ObAdManager.settings_update_genre_list('disabled');

      if(response.data.enabled) $('#ob_ad_manager_enabled_genre').val(response.data.enabled.id);
      if(response.data.disabled) $('#ob_ad_manager_disabled_genre').val(response.data.disabled.id);

      // show device list
      $.each(devices,function(index,device) {
        $('#ob_ad_manager_device_cache_list').append('<div><input type="checkbox" class="ob_ad_manager_clear_cache" value="'+device.id+'"> '+htmlspecialchars(device.name)+'</div>');
      });

      if(response.data.devices_clear_cache.length) $.each(response.data.devices_clear_cache, function(index,device_id)
      {
        $('.ob_ad_manager_clear_cache[value='+device_id+']').attr('checked','checked');
      });

    });
  });

}

OBModules.ObAdManager.settings_update_genre_list = function(field)
{
  var selected_category = $('#ob_ad_manager_'+field+'_category').val();

  $('#ob_ad_manager_'+field+'_genre').find('option').remove();

  // fill genre list
  for(var i in OB.Settings.genres)
  {
    if(OB.Settings.genres[i].media_category_id == selected_category)
      $('#ob_ad_manager_'+field+'_genre').append('<option value="'+OB.Settings.genres[i].id+'">'+htmlspecialchars(OB.Settings.genres[i].name)+'</option>');
  }
}

OBModules.ObAdManager.save_settings = function()
{
  var timezone = $('#ob_ad_manager_timezone').val();
  var enabled_id = $('#ob_ad_manager_enabled_genre').val();
  var disabled_id = $('#ob_ad_manager_disabled_genre').val();
  var devices_clear_cache = [];

  $('.ob_ad_manager_clear_cache').each(function(index,element)
  {
    if($(element).is(':checked')) devices_clear_cache.push($(element).val());
  });

  OB.API.post('obadmanager','save_settings',{'enabled': enabled_id, 'disabled': disabled_id, 'timezone': timezone, 'devices_clear_cache': devices_clear_cache},function(response)
  {
    $('#ob_ad_manager_message').obWidget(!response.status ? 'error' : 'success', response.msg);
  });
}

