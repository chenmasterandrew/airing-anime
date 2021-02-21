# Airing-Anime Alexa Skill

![Image](https://i.imgur.com/xvZIaan.png)

An Alexa Skill for reminders about currently airing anime on your https://anilist.co watching list. Airing-Anime is made using the Anilist API, the Alexa SDK, and the anilist-node API wrapper.

>currently configured for one specific Anilist account: https://anilist.co/user/airinganime/animelist
>All commands relating to the user's own list of currently airing anime will pull data from this specific example list

*For the DALI Lab API challenge (for 21S)*

## Demos
https://www.dropbox.com/sh/f2a6pqliwj585io/AACClY8XKdAF0APrqSLfLlMZa?dl=0

> If you woud like beta access to this Alexa skill on your own Alexa device, please send a message to me at Darude#8096 on Discord or email me at andrew.w.chen.24@dartmouth.edu with the email address you would like me to send the beta access link to.

## Features + Sample Questions

**Getting a list of airing anime on a specific day or week**
* Alexa, ask Airing Anime `what's airing today.`
* Alexa, ask Airing Anime `what's airing on Sunday.`
* Alexa, ask Airing Anime `what's airing this week.`
* Alexa, ask Airing Anime `what's airing on February 21st, 2021.`

**Getting how many episodes a specific anime has**
* Alexa, ask Airing Anime `how many episodes did Psycho Pass have.`
* Alexa, ask Airing Anime `episodes in Attack on Titan.`
* Alexa, ask Airing Anime `how many episodes will be in Attack on Titan Final Season`
* Alexa, ask Airing Anime `how many episodes are in Kaguya Sama Love is War`

**Getting when an anime aired**
* Alexa, ask Airing Anime `when was Psycho Pass airing.`
* Alexa, ask Airing Anime `when is Attack on Titan Final Season.`
* Alexa, ask Airing Anime `what year did Psycho Pass air.`
* Alexa, ask Airing Anime `when will Kaguya Sama Love is War air`

**Getting how highly rated an anime is**
* Alexa, ask Airing Anime `is Psycho Pass popular.`
* Alexa, ask Airing Anime `was Attack on Titan popular.`
* Alexa, ask Airing Anime `how popular was Attack on Titan Final Season`
* Alexa, ask Airing Anime `how popular is Kaguya Sama Love is War`

**Getting the genres of an anime**
* Alexa, ask Airing Anime `what genres was Psycho Pass.`
* Alexa, ask Airing Anime `what genre was Attack on Titan.`
* Alexa, ask Airing Anime `what genres is Attack on Titan Final Season.`
* Alexa, ask Airing Anime `what genre is Kaguya Sama Love is War.`

**Getting the studios of an anime**
* Alexa, ask Airing Anime `what studio made Psycho Pass.`
* Alexa, ask Airing Anime `what studios make Attack on Titan.`
* Alexa, ask Airing Anime `which studio is making Attack on Titan Final Season.`
* Alexa, ask Airing Anime `which studios made Kaguya Sama Love is War.`

## Known Issues:
* handling unaired shows and null values for startDate, endDate, length, etc
* getting user-specific AniList data
* unknown database query limitations
