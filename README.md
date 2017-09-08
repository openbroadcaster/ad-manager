ObAdManager
===========

Manage ADs or PSA

Admanager has settings for "enabled" and "disabled" media. Select the ads you want to include, and the time frame to play those ads. They are managed into categories; "Upcoming", "Current", and "Expired" based on their timeframe.
 
If the current date/time is in the timeframe for that media ("Current Ads"), it will get moved to the enabled genre.
 
If the current date/time is outside the timeframe for that media ("Expired Ads" and "Upcoming Ads"), it will get moved to the disabled genre.
 
This allows you to schedule the "enabled" genre on playlists. Any enabled ads (within timeframe) will play while any disabled ads (outside timeframe) will be excluded.

Cron job required to adjust the category/genre.

* * * * * wget -qO- --post-data="c=obadmanager&a=adjust_media&d={}" https://IP_of_Server/api.php &> /dev/null
