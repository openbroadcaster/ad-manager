var ModuleObAdManager = new Object();


/* Manager Page */

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

    if(!settings.data.enabled || !settings.data.disabled || !settings.data.timezone)
    {
      $('#ob_ad_manager_messagebox').text('The ad manager does not seem to be configured properly.  Please adjust settings in "admin -> ad manager settings", or contact an administrator for assistance.').show();
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

        ModuleObAdManager.add_item(item_id,item_name,item_type);

      }
    });

    ModuleObAdManager.get_items();

  });
}

ModuleObAdManager.get_items = function()
{

  api.post('obadmanager','get_items',{},function(response)
  {
    if(!response.status) return;

    ModuleObAdManager.items_cache = {};

    $('#ob_ad_manager_expired tbody').remove();
    $('#ob_ad_manager_current tbody').remove();
    $('#ob_ad_manager_upcoming tbody').remove();

    $('#ob_ad_manager_expired').append(ModuleObAdManager.tbody_html(response.data.expired));
    $('#ob_ad_manager_current').append(ModuleObAdManager.tbody_html(response.data.current));
    $('#ob_ad_manager_upcoming').append(ModuleObAdManager.tbody_html(response.data.upcoming));

    if(!$('#ob_ad_manager_expired tbody').length) $('#ob_ad_manager_expired').append('<tbody><tr><td colspan="4">No ads found.</td></tr></tbody>');
    if(!$('#ob_ad_manager_current tbody').length) $('#ob_ad_manager_current').append('<tbody><tr><td colspan="4">No ads found.</td></tr></tbody>');
    if(!$('#ob_ad_manager_upcoming tbody').length) $('#ob_ad_manager_upcoming').append('<tbody><tr><td colspan="4">No ads found.</td></tr></tbody>');

    $('#ob_ad_manager table tr.ad_item').dblclick(ModuleObAdManager.edit_item);
  });

}

ModuleObAdManager.tbody_html = function(items)
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

    ModuleObAdManager.items_cache[item.id] = item;
  }); 

  return '<tbody>'+$tbody.html()+'</tbody>';
}

ModuleObAdManager.edit_item = function()
{
  var item = ModuleObAdManager.items_cache[$(this).attr('data-id')];

  ModuleObAdManager.addedit_window();

  $('#ob_ad_manager_start_date').val(item.start_date);
  $('#ob_ad_manager_start_time').val(item.start_time);
  $('#ob_ad_manager_stop_date').val(item.stop_date);
  $('#ob_ad_manager_stop_time').val(item.stop_time);
  $('#ob_ad_manager_item_id').val(item.media_id);
  $('#ob_ad_manager_id').val(item.id);

  $('#ob_ad_manager_notes').val(item.notes);
}

ModuleObAdManager.add_item = function(item_id,item_name,item_type)
{

  this.addedit_window();

  $('#DOMWindow').find('.edit_only').hide();

  $('#ob_ad_manager_item_id').val(item_id);
  $('#ob_ad_manager_item_info').text(item_name+' (media #'+item_id+')');

}

ModuleObAdManager.save_item = function()
{

  fields = new Object();

  fields.notes = $('#ob_ad_manager_notes').val();

  fields.start_date = $('#ob_ad_manager_start_date').val();
  fields.start_time = $('#ob_ad_manager_start_time').val();

  fields.stop_date = $('#ob_ad_manager_stop_date').val();
  fields.stop_time = $('#ob_ad_manager_stop_time').val();

  fields.id = $('#ob_ad_manager_id').val();
  fields.item_id = $('#ob_ad_manager_item_id').val();

  $('#ob_ad_manager_addedit_messagebox').hide();

  api.post('obadmanager','save_item',fields,function(data) 
  {

    if(data.status==false)
    {
      $('#ob_ad_manager_addedit_messagebox').text(data.msg).show();
    }

    else
    {
      layout.close_dom_window();
      ModuleObAdManager.get_items();
    }

  });

}

ModuleObAdManager.addedit_window = function()
{

  layout.open_dom_window();
  $('#DOMWindow').html(html.get('modules/ob_ad_manager/manager_addedit.html'));

  // friendly date picker
  $('#ob_ad_manager_start_date').datepicker({ dateFormat: "yy-mm-dd" });
  $('#ob_ad_manager_stop_date').datepicker({ dateFormat: "yy-mm-dd" });

  // friendly time picker
  $('#ob_ad_manager_start_time').timepicker({timeFormat: 'hh:mm:ss',showSecond: true});
  $('#ob_ad_manager_stop_time').timepicker({timeFormat: 'hh:mm:ss',showSecond: true});

}

ModuleObAdManager.delete_item = function(confirm)
{
  if(confirm)
  {
    api.post('obadmanager','delete_item',{ 'id': $('#ob_ad_manager_id').val() }, function(data)
    {
      if(data.status==true)
      {
        layout.close_dom_window();
        ModuleObAdManager.get_items();
      }

      else
      {
        $('#ob_ad_manager_addedit_messagebox').text(data.msg);
      }
    });

  }

  else
  {
    $('#ob_ad_manager_addedit_messagebox').html('<p>Delete this item?</p><p><input type="button" value="Yes, Delete" onclick="ModuleObAdManager.delete_item(true);"> &nbsp; &nbsp; <input type="button" value="No, Cancel" onclick="$(\'#ob_ad_manager_addedit_messagebox\').hide();"></p>').show();
  }
}






/* Settings Page */

ModuleObAdManager.load_settings = function()
{

  api.post('obadmanager','get_settings',{},function(response)     
  { 
    api.post('device','device_list', {}, function(devices_response)
    {

      var devices = devices_response.data;

      $('#layout_main').html(html.get('modules/ob_ad_manager/settings.html'));
      $('#ob_ad_manager_timezone').html(html.get('device/tzoptions.html'));

      // fill category list
      for(var i in settings.categories)
      {
        $('#ob_ad_manager_enabled_category').append('<option value="'+settings.categories[i].id+'">'+htmlspecialchars(settings.categories[i].name)+'</option>');
        $('#ob_ad_manager_disabled_category').append('<option value="'+settings.categories[i].id+'">'+htmlspecialchars(settings.categories[i].name)+'</option>');
      }

      $('#ob_ad_manager_enabled_category').change(function() { ModuleObAdManager.settings_update_genre_list('enabled'); });
      $('#ob_ad_manager_disabled_category').change(function() { ModuleObAdManager.settings_update_genre_list('disabled'); });

      if(response.data.timezone) $('#ob_ad_manager_timezone').val(response.data.timezone);
      if(response.data.enabled) $('#ob_ad_manager_enabled_category').val(response.data.enabled.media_category_id);
      if(response.data.disabled) $('#ob_ad_manager_disabled_category').val(response.data.disabled.media_category_id);

      ModuleObAdManager.settings_update_genre_list('enabled');
      ModuleObAdManager.settings_update_genre_list('disabled');

      if(response.data.enabled) $('#ob_ad_manager_enabled_genre').val(response.data.enabled.id);
      if(response.data.disabled) $('#ob_ad_manager_disabled_genre').val(response.data.disabled.id);

      // show device list
      $.each(devices,function(index,device) {
        $('#ob_ad_manager_device_cache_list').append('<div><input type="checkbox" class="ob_ad_manager_clear_cache" value="'+device.id+'"> '+htmlspecialchars(device.name)+'</div>');
      });

    });
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
  var timezone = $('#ob_ad_manager_timezone').val();
  var enabled_id = $('#ob_ad_manager_enabled_genre').val();
  var disabled_id = $('#ob_ad_manager_disabled_genre').val();
  var devices_clear_cache = [];

  $('.ob_ad_manager_clear_cache').each(function(index,element)
  {
    if($(element).is(':checked')) devices_clear_cache.push($(element).val());
  });

  $('#ob_ad_manager_messagebox').hide();

  api.post('obadmanager','save_settings',{'enabled': enabled_id, 'disabled': disabled_id, 'timezone': timezone, 'devices_clear_cache': devices_clear_cache},function(response)
  {
    $('#ob_ad_manager_messagebox').text(response.msg).show();
  });
}


$(document).ready(function() {
  ModuleObAdManager.init_module();
});
