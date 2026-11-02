/**
 * Game information
 */
type Game = {
    boxArtURL: string;
    id: string;
    slug: string;
    displayName: string;
    name: string;
    __typename: "Game";
};

/**
 * Broadcast ID represented as a string
 */
type BroadcastIdOnly = {
    id: string;
    __typename: "BroadcastIdOnly";
};

/**
 * Twitch user roles (which this seems like it's barely used)
 */
type UserRoles = {
    isPartner: boolean,
    __typename: "UserRoles"
}

/**
 * User information
 */
type User = {
    displayName: string;
    id: string;
    login: string;
    /** Sometimes doesn't appear in some cases */
    profileImageURL?: string;
    /** Sometimes doesn't appear in some cases */
    primaryColorHex?: string;
    /** Sometimes doesn't appear in some cases */
    roles?: UserRoles;
    __typename: "User";
};

/**
 * ?
 */
type VideoSelfEdge = {
    "isRestricted": boolean,
    /** unsure what this exactly can return atm */
    "viewingHistory": null,
    "__typename": "VideoSelfEdge"
}

/**
 * Shared chat users
 */
type GuestStarParticipants = {
    "guests": User[],
    "sessionIdentifier": string,
    "__typename": "GuestStarParticipants"
}

/**
 * Video Edge
 */
type VideoEdge = {
    animatedPreviewURL: string;
    game?: Game;
    broadcastIdentifier: BroadcastIdOnly,
    id: string;
    "lengthSeconds": number,
    "owner": User
    "previewThumbnailURL": string,
    /** Formated as `YYYY`-`MM`-`DD`T`HH`:`SS`:`???` */
    "publishedAt": string,
    "self": VideoSelfEdge,
    "title": string,
    "viewCount": number,
    "resourceRestriction": null,
    "contentTags": Tags[],
    __typename: 'Video';
}

/**
 * Clip Edge
 */
type ClipEdge = {
    game?: Game;
    id: string;
    slug: string;
    url: string;
    embedURL: string;
    title: string;
    viewCount: number;
    language: string;
    curator: User;
    game?: Game;
    broadcastIdentifier: BroadcastIdOnly;
    broadcaster: User;
    thumbnailURL: string;
    /** Formated as `YYYY`-`MM`-`DD`T`HH`:`SS`:`???` */
    createdAt: string;
    durationSeconds: number,
    "champBadge": null,
    "isFeatured": true,
    "isAutoCurated": false,
    "guestStarParticipants": GuestStarParticipants,
    __typename: 'Clip';
}
