---
layout: default
title: index
---

# AdManager #
{:.no_toc}

* TOC
{:toc}

##  Manage ADs or PSA

Admanager has settings for "enabled" and "disabled" media. Select the ads you want to include, and the time frame to play those ads. They are managed into categories; "Upcoming", "Current", and "Expired" based on their timeframe.
 
If the current date/time is in the timeframe for that media ("Current Ads"), it will get moved to the enabled genre. If the current date/time is outside the timeframe for that media ("Expired Ads" and "Upcoming Ads"), it will get moved to the disabled genre.
 
This allows you to schedule the "enabled" genre on playlists. Any enabled ads (within timeframe) will play while any disabled ads (outside timeframe) will be excluded.  Additional functionality can be used with advanced searches, to purge all items that have expired.

## Using AdManager

Drag media item into AdManager.  Window pops up, Set start and stop dates.

A more automated scheme is to create a dynamic segment in scheduled Play List for your media (IE your media has the word “CFET” in description, Category is “PSA Audio” and Genre is “Enabled”  in PL with this criteria.  When Playlist looks to play Dynamic Segment, it will look for media that has “CFET” in description, Category “PSA Audio” and is Genre “Enabled”.   Adding future media items to library with Dynamic segment set will ingest into Playlist with matching searches.

When media finishes it's run, it changes the genre to disabled automatically and places the media in the Expired queue.  Filters will not play items that have genre “Disabled”

Double click from From Expired list and individually delete expired items. Delete multiple expired items by running a saved search for genre = Disable.  Highlight and delete all media items marked Disabled (expired) to remove from AdManager and library. 

![AdManager](/img/ADManager.png){: .screenshot} 

## AdManager Setup

Only one category may be managed. In example we have AdManager running PSA Audio.

1. `Admin>Media Settings` Create Genres `Enabled` and `Disabled` associated with on category.

1. Access the Setup window from Admin menu. Set the time zone of Player to be managed by AdManager

1. In AdManager Settings, Select the Category of media to be managed and choose the `Enabled` and `Disabled` for the category.

![AdManager Settings](/img/ADManager_Settings.png){: .screenshot} 

## Cron Job

Cron job required to adjust the category/genre.

~~~~ 
* * * * * wget -qO- --post-data="c=obadmanager&a=adjust_media&d={}" https://IP_of_Server/api.php &> /dev/null
~~~~ 

