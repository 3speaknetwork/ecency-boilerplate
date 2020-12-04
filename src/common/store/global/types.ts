import {LocationChangeAction} from "../common";

export enum ListStyle {
    row = "row",
    grid = "grid",
}

export enum Theme {
    day = "day",
    night = "night",
}

export enum EntryFilter {
    trending = "trending",
    hot = "hot",
    created = "created",
    payout = "payout",
    muted = "muted"
}

export enum ProfileFilter {
    blog = "blog",
    posts = "posts",
    comments = "comments",
    replies = "replies",
}

// TODO: Find a proper way to merge EntryFilter and ProfileFilter
export enum AllFilter {
    trending = "trending",
    hot = "hot",
    created = "created",
    payout = "payout",
    muted = "muted",  // To see muted accounts
    blog = "blog",  // This might be deleted
    posts = "posts",
    comments = "comments",
    replies = "replies",
    feed = "feed"
}

export interface Global {
    filter: EntryFilter | ProfileFilter | AllFilter;
    tag: string;
    theme: Theme;
    listStyle: ListStyle;
    intro: boolean;
    currency: string;
    currencyRate: number;
    currencySymbol: string;
    searchIndexCount: number;
    canUseWebp: boolean;
    hasKeyChain: boolean;
    isElectron: boolean;
    newVersion: string | null;
    notifications: boolean;
}

export enum ActionTypes {
    THEME_CHANGE = "@global/THEME_CHANGE",
    INTRO_HIDE = "@global/INTRO_HIDE",
    LIST_STYLE_CHANGE = "@global/LIST_STYLE_CHANGE",
    HAS_KEYCHAIN = "@global/HAS_KEYCHAIN",
    NOTIFICATIONS_MUTE = "@global/NOTIFICATIONS_MUTE",
    NOTIFICATIONS_UNMUTE = "@global/NOTIFICATIONS_UNMUTE",
    NEW_VERSION_CHANGE = "@global/NEW_VERSION_CHANGE",
}

export interface ThemeChangeAction {
    type: ActionTypes.THEME_CHANGE;
    theme: Theme;
}

export interface IntroHideAction {
    type: ActionTypes.INTRO_HIDE;
}

export interface ListStyleChangeAction {
    type: ActionTypes.LIST_STYLE_CHANGE;
    listStyle: ListStyle;
}

export interface NewVersionChangeAction {
    type: ActionTypes.NEW_VERSION_CHANGE;
    version: string | null;
}

export interface NotificationsMuteAction {
    type: ActionTypes.NOTIFICATIONS_MUTE;
}

export interface NotificationsUnMuteAction {
    type: ActionTypes.NOTIFICATIONS_UNMUTE;
}

export interface HasKeyChainAction {
    type: ActionTypes.HAS_KEYCHAIN;
}

export type Actions =
    LocationChangeAction
    | ThemeChangeAction
    | IntroHideAction
    | ListStyleChangeAction
    | NewVersionChangeAction
    | NotificationsMuteAction
    | NotificationsUnMuteAction
    | HasKeyChainAction ;
