import React, {Component} from "react";
import {History, Location} from "history";

import moment from "moment";

import isEqual from "react-fast-compare";

import {Entry, EntryVote} from "../../store/entries/types";
import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {DynamicProps} from "../../store/dynamic-props/types";
import {Community, Communities} from "../../store/communities/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {Reblog} from "../../store/reblogs/types";
import {UI, ToggleType} from "../../store/ui/types";

import defaults from "../../constants/defaults.json";

import {
    catchPostImage,
    postBodySummary,
    setProxyBase,
    // @ts-ignore
} from "@ecency/render-helper";

setProxyBase(defaults.imageServer);

import ProfileLink from "../profile-link/index";
import Tag from "../tag";
import UserAvatar from "../user-avatar/index";
import EntryLink from "../entry-link/index";
import EntryVoteBtn from "../entry-vote-btn/index";
import EntryReblogBtn from "../entry-reblog-btn/index";
import EntryPayout from "../entry-payout/index";
import EntryVotes from "../entry-votes";
import Tooltip from "../tooltip";

import parseDate from "../../helper/parse-date";

import {_t} from "../../i18n";

import _c from "../../util/fix-class-names";

import {repeatSvg, pinSvg, commentSvg} from "../../img/svg";
import accountReputation from '../../helper/account-reputation';

const fallbackImage = require("../../img/fallback.png");
const noImage = require("../../img/noimage.png");

interface Props {
    history: History;
    location: Location;
    global: Global;
    dynamicProps: DynamicProps;
    communities: Communities;
    community?: Community | null;
    users: User[];
    activeUser: ActiveUser | null;
    reblogs: Reblog[];
    entry: Entry;
    ui: UI;
    asAuthor: string;
    promoted: boolean;
    addAccount: (data: Account) => void;
    updateEntry: (entry: Entry) => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data?: Account) => void;
    deleteUser: (username: string) => void;
    addReblog: (account: string, author: string, permlink: string) => void;
    toggleUIProp: (what: ToggleType) => void;
}

export default class EntryListItem extends Component<Props> {
    public static defaultProps = {
        asAuthor: "",
        promoted: false,
    };

    shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
        return (
            !isEqual(this.props.entry, nextProps.entry) ||
            !isEqual(this.props.community, nextProps.community) ||
            !isEqual(this.props.global, nextProps.global) ||
            !isEqual(this.props.dynamicProps, nextProps.dynamicProps) ||
            !isEqual(this.props.activeUser, nextProps.activeUser) ||
            !isEqual(this.props.reblogs, nextProps.reblogs)
        );
    }

    afterVote = (votes: EntryVote[], estimated: number) => {
        const {entry, updateEntry} = this.props;

        const {payout} = entry;
        const newPayout = payout + estimated;

        updateEntry({
            ...entry,
            active_votes: votes,
            payout: newPayout,
            pending_payout_value: String(newPayout)
        });
    };

    render() {

        const {entry, community, asAuthor, promoted, global} = this.props;

        const imgGrid: string = (global.canUseWebp ? catchPostImage(entry, 600, 500, 'webp') : catchPostImage(entry, 600, 500)) || noImage;
        const imgRow: string = (global.canUseWebp ? catchPostImage(entry, 260, 200, 'webp') : catchPostImage(entry, 260, 200)) || noImage;

        const summary: string = postBodySummary(entry, 200);

        const reputation = accountReputation(entry.author_reputation);
        const date = moment(parseDate(entry.created));
        const dateRelative = date.fromNow(true);
        const dateFormatted = date.format("LLLL");

        const isChild = !!entry.parent_author;

        const title = entry.title;

        const isVisited = false;
        const isPinned = community && !!entry.stats?.is_pinned;

        let reBlogged: string | undefined;
        if (asAuthor && asAuthor !== entry.author && !isChild) {
            reBlogged = asAuthor;
        }

        if (entry.reblogged_by && entry.reblogged_by.length > 0) {
            [reBlogged] = entry.reblogged_by;
        }

        let thumb: JSX.Element | null = null;
        if (global.listStyle === 'grid') {
            thumb = (
                <img src={imgGrid} alt={title} onError={(e: React.SyntheticEvent) => {
                    const target = e.target as HTMLImageElement;
                    target.src = fallbackImage;
                }}
                />
            );
        }
        if (global.listStyle === 'row') {
            thumb = (
                <picture>
                    <source srcSet={imgRow} media="(min-width: 576px)"/>
                    <img srcSet={imgGrid} alt={title} onError={(e: React.SyntheticEvent) => {
                        const target = e.target as HTMLImageElement;
                        target.src = fallbackImage;
                    }}/>
                </picture>
            );
        }
        const cls = `entry-list-item ${promoted ? "promoted-item" : ""}`;
        return (
            <div className={_c(cls)}>
                <div className="item-header">
                    <div className="item-header-main">
                        <div className="author-part">
                            {ProfileLink({
                                ...this.props,
                                username: entry.author,
                                children: <a className="author-avatar">{UserAvatar({...this.props, username: entry.author, size: "small"})}</a>
                            })}
                            {ProfileLink({
                                ...this.props,
                                username: entry.author,
                                children: <div className="author notranslate">{entry.author}<span className="author-reputation">{reputation}</span></div>
                            })}
                        </div>
                        {Tag({
                            ...this.props,
                            tag: entry.community && entry.community_title ? {name: entry.community, title: entry.community_title} : entry.category,
                            type: "link",
                            children: <a className="category">{entry.community_title || entry.category}</a>
                        })}
                        {!isVisited && <span className="read-mark"/>}
                        <span className="date" title={dateFormatted}>{dateRelative}</span>
                    </div>
                    <div className="item-header-features">
                        {isPinned && (
                            <Tooltip content={_t("entry-list-item.pinned")}>
                                <span className="pinned">{pinSvg}</span>
                            </Tooltip>
                        )}
                        {reBlogged && (
                            <span className="reblogged">{repeatSvg} {_t("entry-list-item.reblogged", {n: reBlogged})}</span>
                        )}
                        {promoted && (
                            <>
                                <span className="flex-spacer"/>
                                <div className="promoted"><a href="/faq#how-promotion-work">{_t("entry-list-item.promoted")}</a></div>
                            </>
                        )}
                    </div>
                </div>
                <div className="item-body">
                    <div className="item-image">
                        {EntryLink({
                            ...this.props,
                            entry,
                            children: <div>
                                {thumb}
                            </div>
                        })}
                    </div>
                    <div className="item-summary">
                        {EntryLink({
                            ...this.props,
                            entry,
                            children: <div className="item-title">{title}</div>
                        })}
                        {EntryLink({
                            ...this.props,
                            entry,
                            children: <div className="item-body">{summary}</div>
                        })}
                    </div>
                    <div className="item-controls">
                        {EntryVoteBtn({
                            ...this.props,
                            afterVote: this.afterVote
                        })}
                        {EntryPayout({
                            ...this.props,
                            entry
                        })}
                        {EntryVotes({
                            ...this.props,
                            entry
                        })}
                        {EntryLink({
                            ...this.props,
                            entry,
                            children: <a className="replies notranslate">
                                <Tooltip
                                    content={
                                        entry.children > 0
                                            ? entry.children === 1
                                            ? _t("entry-list-item.replies")
                                            : _t("entry-list-item.replies-n", {n: entry.children})
                                            : _t("entry-list-item.no-replies")
                                    }>
                                <span className="inner">
                                  {commentSvg} {entry.children}
                                </span>
                                </Tooltip>
                            </a>
                        })}
                        {EntryReblogBtn({
                            ...this.props,
                            text: false
                        })}
                    </div>
                </div>
            </div>
        );
    }
}
