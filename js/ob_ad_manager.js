

var ModuleObAdManager = new Object();

ModuleObAdManager.init_module = function()
{
  $('#obmenu-media').append('<li data-permissions="create_own_media"><a href="javascript: ModuleObAdManager.load();">Ad Manager</a></li>');
  $('#obmenu-admin').append('<li data-permissions="create_own_media"><a href="javascript: ModuleObAdManager.load_settings();">Ad Manager Settings</a></li>');
}

ModuleObAdManager.load = function()
{
  alert('load ob ad manager');
}

ModuleObAdManager.load_settings = function()
{
  alert('load ob ad manager settings');
}

$(document).ready(function() {
	ModuleObAdManager.init_module();
});
