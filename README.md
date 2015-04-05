ObAdManager
===========

Manage AD channel

Cron job required to adjust the category/genre.

* * * * * wget -qO- --post-data="c=obadmanager&a=adjust_media&d={}" https://IP_of_Server/api.php &> /dev/null
