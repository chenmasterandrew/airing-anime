const Alexa = require('ask-sdk-core');
const AmazonDateParser = require('amazon-date-parser');
const anilist = require('anilist-node');
const Anilist = new anilist(/*settings.token*/);

// HELPER FUNCTIONS
function getAnimeList(nameOrID) {
    return Anilist.lists.anime(nameOrID)
}

function getAnime(ID) {
    return Anilist.media.anime(ID)
}

function amazonifyDate(date) {
    // from https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
    const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
    const mo = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(date);
    const da = new Intl.DateTimeFormat('en', { day: 'numeric' }).format(date);
    return (`${ye}-${mo}-${da}`);
}

function stringifyDate(date) {
    // from https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
    const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
    const mo = new Intl.DateTimeFormat('en', { month: 'long' }).format(date);
    const da = new Intl.DateTimeFormat('en', { day: 'numeric' }).format(date);
    return (`${mo} ${da}`);
    //return (`${da}-${mo}-${ye}`);
}

function stringifySeconds(seconds) {
    // from https://stackoverflow.com/questions/36098913/convert-seconds-to-days-hours-minutes-and-seconds
    var secs = parseInt(seconds, 10);
    var days = Math.floor(secs / (3600*24));
    secs  -= days*3600*24;
    var hrs   = Math.floor(secs / 3600);
    secs  -= hrs*3600;
    var mnts = Math.floor(secs / 60);
    secs  -= mnts*60;

    var returnStatement = "";
    var started = false;
    if (days !==0) {
        returnStatement += (days+" days");
        started = true;
    }
    if (hrs !== 0) {
        if (started) {
            returnStatement += ", ";
        }
        returnStatement += (hrs+" hrs");
        started = true;
    }
    if (mnts !== 0) {
        if (started) {
            returnStatement += ", ";
        }
        returnStatement += (mnts+" minutes");
        started = true;
    }
    /*
    if (secs != 0) {
        if (started) {
            returnStatement += ", and ";
        }
        returnStatement += (secs+" seconds");
    }*/
    return returnStatement
}

async function getAiringAnimeOnDate(date) {
        
    try {
        const startDate = new AmazonDateParser(date).startDate;
        const endDate = new AmazonDateParser(date).endDate;

        // userLists is an Array.<UserLists>
        // must be narrowed down to the current list
        let userLists = await getAnimeList("airinganime");

        const userListsLength = userLists.length;
        let currentList
        let i;
        for (i = 0; i < userListsLength; i++) {
            if (userLists[i].status === "CURRENT") {
                currentList = userLists[i].entries;
                break
            }
        }
            
        // currentList is an Array.<ListEntry>
        // each episode of each entry must be verified to be currently airing
        // by cross checking ListEntry objects against AnimeEntry objects
        // each AnimeEntry's list of episodes will be checked for matches against the submitted date
        // creates an array of literals in format: {anime: String, episode: String, date: Date(), timeUntil: Number (in seconds)}
        const currentListLength = userLists.length;
        let currentAiringEpisodesList = [];
        let promises = []; // list of promises to settle before proceeding
        for (i = 0; i < currentListLength; i++) {
            let currentAnime = await getAnime(currentList[i].media.id)
            const animeTitle = currentAnime.title.english/*userPreferred*/;
            const currentAnimeAiringSchedule = currentAnime.airingSchedule;
            const currentAnimeAiringScheduleLength = currentAnimeAiringSchedule.length;
            let j;
            for (j = 0; j < currentAnimeAiringScheduleLength; j++) {
                const episodeDate = new Date(currentAnimeAiringSchedule[j].airingAt * 1000);
                if (startDate <= episodeDate && episodeDate <= endDate) {
                    const episodeNumber = currentAnimeAiringSchedule[j].episode;
                    const timeUntil = currentAnimeAiringSchedule[j].timeUntilAiring;
                    currentAiringEpisodesList.push({anime: animeTitle, episode: episodeNumber, date: episodeDate, timeUntil: timeUntil});
                }
            }  
        }

        console.log("successfully retrieved airing anime");
        // array of literals in format: {anime: String, episode: String, date: Date(), timeUntil: Number (in seconds)}
        return currentAiringEpisodesList;
    
    } catch(err) {
        console.log("unable to retrieve airing anime");
        console.log(err.toString());
        return [];
    }
}

async function speakifyAiringAnimeOnDate(date) {
    let speakOutput = "";
    const currentAiringEpisodesList = await getAiringAnimeOnDate(date);
    let i;
    for (i = 0; i < currentAiringEpisodesList.length; i++) {
        const currentEpisode = currentAiringEpisodesList[i];
        speakOutput += (currentEpisode.anime + " episode " + currentEpisode.episode + " airs on " + stringifyDate(currentEpisode.date) + " in " + stringifySeconds(currentEpisode.timeUntil) + ".\n");
    }
    if (currentAiringEpisodesList.length === 0) {
        speakOutput = "You are not watching any anime airing on that day."
    }
    return speakOutput;
}

async function searchAnime(name) { // uses a name to return null or an AnimeEntry value
    let animeSearchResults = await Anilist.search("anime", name, 1, 1);
    let value;
    if (animeSearchResults.media.length === 1) {
        let anime = await getAnime(animeSearchResults.media[0].id);
        if (!anime.isAdult) {
            value = anime;
        }
    }
    return value;
}

function checkAnimeAired(date) {// uses AnimeEntry value to return whether or not the first episode has occurred yet
    if (date <= new Date()) {
        return true;
    } else {
        return false;
    }

}

function checkAnimeEnded(date) {// uses AnimeEntry value to return whether or not the last episode has occurred yet
    if (date <= new Date()) {
        return true;
    } else {
        return false;
    }

}

function convertAnilistDate(anilistDate) {
    return new Date(`${anilistDate.month}-${anilistDate.day}-${anilistDate.year}`);
}

// ALEXA COMMANDS

/* *
 * GetAiringScheduleIntentHandler triggers when a customer asks about "what's airing on {date, day, week, etc}"
 * */
async function GetAiringScheduleIntentHandler(date) {
    let speakOutput = await speakifyAiringAnimeOnDate(date);
    return speakOutput;
}

/* *
 * GetAnimeEpisodesIntentHandler triggers when a customer asks about "how many episodes are in {anime}"
 * */
async function GetAnimeEpisodesIntentHandler(animeName) {
    let anime = await searchAnime(animeName);
    let speakOutput;
    if (anime != null) {
        speakOutput = (anime.title.english + " has " + anime.episodes + " episodes.");
    } else {
        speakOutput = ("Unable to find an anime called " + name);
    }
    
    return speakOutput;
}

/* *
 * GetAnimeAirDateIntentHandler triggers when a customer asks about "when {anime} aired"
 * */
async function GetAnimeAirDateIntentHandler(animeName) {
    let anime = await searchAnime(animeName);
    let speakOutput;
    if (anime != null) {
        startDate = convertAnilistDate(anime.startDate);
        past = checkAnimeAired(startDate);
        let tenseVerb;
        if (past) {
            tenseVerb = "aired";
        } else {
            tenseVerb = "airs";
        }

        speakOutput = (`${anime.title.english} ${tenseVerb} ${anime.season} ${anime.startDate.year} on ${stringifyDate(startDate)}.`);
    } else {
        speakOutput = ("Unable to find an anime called " + name);
    }
    
    return (speakOutput);
}


/* *
 * GetAnimeRatingIntentHandler triggers when a customer asks about "what {anime}'s rating"
 * */
async function GetAnimeRatingIntentHandler(animeName) {
    let anime = await searchAnime(animeName);
    let speakOutput;
    if (anime != null) {
        speakOutput = (`According to Anilist, ${anime.title.english} has an average score of ${anime.meanScore} out of one hundred.`);
        for (var i = 0, size = anime.rankings.length; i < size ; i++){
            let ranking = anime.rankings[i];
            let seasonDesc = ""
            if (ranking.season != null) {
                seasonDesc = " for " + ranking.season
            }
            let yearDesc = ""
            if (ranking.year != null) {
                yearDesc = " in " + ranking.year
            }
            speakOutput += (` It is number ${ranking.rank} ${ranking.context}${seasonDesc}${yearDesc}.`);
        }
    } else {
        speakOutput = ("Unable to find an anime called " + name);
    }
    
    return speakOutput;
}

/* *
 * GetAnimeGenresIntentHandler triggers when a customer asks about "what are {anime}'s genres"
 * */
async function GetAnimeGenresIntentHandler(animeName) {
    let anime = await searchAnime(animeName);
    let speakOutput;
    if (anime != null) {
        past = checkAnimeAired(convertAnilistDate(anime.startDate));
        let tenseVerb;
        if (past) {
            tenseVerb = "has";
        } else {
            tenseVerb = "will have";
        }
        if (anime.genres.length === 0) {
            speakOutput = (`${anime.title.english} ${tenseVerb} no genres.`);
        } else {
            speakOutput = (`${anime.title.english} ${tenseVerb} the genres`);
            for (var i = 0, size = anime.genres.length; i < size ; i++){
                speakOutput += (` ${anime.genres[i]},`)
            }
        }
    } else {
        speakOutput = ("Unable to find an anime called " + name);
    }
    
    return speakOutput; 
}

/* *
 * GetAnimeStudiosIntentHandler triggers when a customer asks about "episodes in {anime}"
 * */
async function GetAnimeStudiosIntentHandler(animeName) {
    let anime = await searchAnime(animeName);
    let speakOutput;
    if (anime != null) {
        ended = checkAnimeEnded(convertAnilistDate(anime.endDate));
        aired = checkAnimeAired(convertAnilistDate(anime.startDate));
        let tenseVerb;
        if (!ended && !aired) {
            tenseVerb = "will be";
        } else if (aired && ended) {
            tenseVerb = "was";
        } else {
            tenseVerb = "is";
        }

        if (anime.studios.length === 0) {
            speakOutput = (`${anime.title.english} ${tenseVerb} by no studios`);
        } else {
            speakOutput = (`${anime.title.english} ${tenseVerb} `);
            animationStudios = [];
            otherStudios = [];
            for (var i = 0, size = anime.studios.length; i < size ; i++){
                let studio = anime.studios[i];
                if (studio.isAnimationStudio) {
                    animationStudios.push(studio)
                } else {
                    otherStudios.push(studio)
                }
            }
            
            if (animationStudios.length != 0) {
                speakOutput += (`animated by `);
                for (var i = 0, size = animationStudios.length; i < size ; i++){
                    speakOutput += (`${animationStudios[i].name}, `)
                }
            }
            if (otherStudios.length != 0) {
                if (animationStudios.length != 0) {
                    speakOutput += "and "
                }
                speakOutput += (`made by `);
                for (var i = 0, size = otherStudios.length; i < size ; i++){
                    speakOutput += (`${otherStudios[i].name}, `)
                }
            } 
        }

    } else {
        speakOutput = ("Unable to find an anime called " + name);
    }
    
    return speakOutput;
}



async function test() {
    //console.log(await GetAiringScheduleIntentHandler("2021-2-21"))
    //console.log(await GetAnimeAirDateIntentHandler("Attack on Titan"))
    //console.log(await GetAnimeRatingIntentHandler("Attack on Titan"))
    //console.log(await GetAnimeGenresIntentHandler("Attack on Titan"))
    console.log(await GetAnimeStudiosIntentHandler("Attack on Titan"))
}

test();