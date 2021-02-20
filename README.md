Ad Manager
===========

Manage ADs or PSA

Ad Manager has settings for "enabled" and "disabled" media. Select and drag the ad media you want to include, and the time frame to play those ads. They are managed into categories; "Upcoming", "Current", and "Expired" based on their timeframe. From media sidebar drag media to admanager screen, popup sets start and stop time with user notes. 
 
If the current date/time is in the timeframe for that media ("Current Ads"), it will get moved to the enabled genre.
 
If the current date/time is outside the timeframe for that media ("Expired Ads" and "Upcoming Ads"), it will get moved to the disabled genre.
 
This allows you to schedule the "enabled" genre on playlists. Any enabled ads (within timeframe) will play while any disabled ads (outside timeframe) will be excluded.  Additional functionality can be used with advanced searches, to purge all items that have expired.  Run a saved search for Category Ads and PSA  "Disabled"to display all the expired media that can be deleted in bulk. Using a combination of Dynamic Sections in PL and filters, it is possible to ingest ads with bulk-import module watch folders.

Configure Ad Manager

>Admin>Settings

Select\Create a combination of category and genre.  Select\Create genres for categories Enabled and Disabled “expired genre” ie Category = PSA, Genre = Enabled and Disabled.

Cron job required to adjust the category/genre.

* * * * * wget -qO- --post-data="c=obadmanager&a=adjust_media&d={}" https://IP_of_Server/api.php &> /dev/null

NOTES:

- in Firefox, disable adblocker plugins or use Chrome browser to see scheduled catagories and items
