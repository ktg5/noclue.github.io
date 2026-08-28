const anonKey = "kimne78kx3ncx6brgo4mv6wki5h1ko";
const gqlUrl = 'https://gql.twitch.tv';


class TwitchGql {
    clientid = "";
    oauth = "";
    integToken = {
        token: "",
        expiration: 0
    };

    constructor(clientid, oauth) {
        this.clientid = clientid;
        this.oauth = oauth;
    }


    async getChannel(name) {
        if (!name) return console.error(`"name" is required but returned null.`);

        return new Promise(async (resolve, reject) => {
            await fetch(`${gqlUrl}/gql`, {
                headers: {
                    "client-id": this.clientid,
                },
                body: JSON.stringify([
                    {
                        "operationName": "VideoPlayerStreamInfoOverlayChannel",
                        "variables": {
                            "channel": name
                        },
                        "extensions": {
                            "persistedQuery": {
                                "version": 1,
                                "sha256Hash": "198492e0857f6aedead9665c81c5a06d67b25b58034649687124083ff288597d"
                            }
                        }
                    },
                    {
                        "operationName": "ActiveWatchParty",
                        "variables": {
                            "channelLogin": name
                        },
                        "extensions": {
                            "persistedQuery": {
                                "version": 1,
                                "sha256Hash": "4a8156c97b19e3a36e081cf6d6ddb5dbf9f9b02ae60e4d2ff26ed70aebc80a30"
                            }
                        }
                    },
                    {
                        "operationName": "Chat_ChannelData",
                        "variables": {
                            "channelLogin": name
                        },
                        "extensions": {
                            "persistedQuery": {
                                "version": 1,
                                "sha256Hash": "3c445f9a8315fa164f2d3fb12c2f932754c2f2c129f952605b9ec6cf026dd362"
                            }
                        }
                    },
                    {
                        "operationName": "ChannelRoot_AboutPanel",
                        "variables": {
                            "channelLogin": name,
                            "skipSchedule": false,
                            "includeIsDJ": true
                        },
                        "extensions": {
                            "persistedQuery": {
                                "version": 1,
                                "sha256Hash": "0df42c4d26990ec1216d0b815c92cc4a4a806e25b352b66ac1dd91d5a1d59b80"
                            }
                        }
                    }
                ]),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();
        
                if (data.errors) resolve({ errors: data.errors });
                else {
                    if (!data[0].data.user) return resolve(null);
        
                    let isLive = data[0].data.user.stream != null;
        
                    let gameSlug;
                    if (data[0].data.user.broadcastSettings.game) gameSlug = data[0].data.user.broadcastSettings.game.slug;
                    let cleanData = {
                        live: isLive,
                        ...data[0].data.user,
                        watchParty: data[1].data.user.activeWatchParty,
                        chatRules: data[2].data.channel.chatSettings.rules,
                        description: data[3].data.user.description,
                        primaryColor: data[3].data.user.primaryColorHex,
                        followerCount: data[3].data.user.followers.totalCount,
                        roles: data[3].data.user.roles,
                        schedule: data[3].data.user.channel.schedule,
                        primaryTeam: data[3].data.user.primaryTeam
                    };
        
                    resolve(cleanData);
                }
            });
        });
    }

    /**
     * Get VODs, highlights or clips from a channel.
     * @param {string} name Name of channel.
     * @param {"ARCHIVE" | "HIGHLIGHT" | "VIDEOS" | "CLIPS"} type The type of media to look for.
     * @param {number} [limit] The amount of items to return back. (Defaults to 30)
     * @param {"LAST_DAY" | "LAST_WEEK" | "LAST_MONTH" | "ALL_TIME"} [sort] This is mostly used for clips, but used to be for everything on a channels page.
     * @returns {Promise<VideoEdge[] | ClipEdge[]>} Returns a list of objects that include data for each media fetched.
     */
    async getChannelMedia(name, type, limit, sort) {
        if (!name) return console.error(`"name" is required but returned null.`);
        name = name.toString();
        if (!type) return console.error(`"type" is required but returned null.`);
        type = type.toString();
        if (!limit || typeof limit !== "number") {
            limit = 30;
            console.warn("limit arg not set, going with \"30\".");
        }

        let bodyString = "";
        switch (type) {
            case "CLIPS":
                bodyString = JSON.stringify({
                    "operationName": "ClipsCards__User",
                    "variables": {
                        "login": name,
                        "limit": limit,
                        "criteria": {
                            "filter": sort ? sort : "LAST_WEEK",
                            "shouldFilterByDiscoverySetting": true
                        },
                        "cursor": null
                    },
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "1cd671bfa12cec480499c087319f26d21925e9695d1f80225aae6a4354f23088"
                        }
                    }
                });
            break;
        
            default:
                if (type == "VIDEOS") type = null;
                bodyString = JSON.stringify({
                    "operationName": "FilterableVideoTower_Videos",
                    "variables": {
                        "includePreviewBlur": false,
                        "limit": limit,
                        "channelOwnerLogin": name,
                        "broadcastType": type,
                        "videoSort": "TIME"
                    },
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "67004f7881e65c297936f32c75246470629557a393788fb5a69d6d9a25a8fd5f"
                        }
                    }
                });
            break;
        }

        return new Promise(async (res, rej) => {
            await fetch(`${gqlUrl}/gql`, {
                headers: {
                    "client-id": this.clientid
                },
                body: bodyString,
                method: "POST"
            }).then(async rawData => {
                const data = await rawData.json();
                if (data.errors) res({ errors: data.errors });

                let cleanData = [];
                if (!data.data.user) res(null);
                
                // Get edges list from whatever type we're trying to fetch
                let edgesList;
                if (data.data.user.videos) edgesList = data.data.user.videos.edges;
                if (data.data.user.clips) edgesList = data.data.user.clips.edges;
                // Put edges for the type we got back into a list
                for (let i = 0; i < edgesList.length; i++) {
                    const element = edgesList[i];
                    cleanData[i] = element.node;
                }
                // Resolve
                res(cleanData);
            });
        });
    }
}


export const twitchgql = new TwitchGql(anonKey);
