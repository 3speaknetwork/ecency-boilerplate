import React, {Component} from "react";

import {History} from "history";

import isEqual from "react-fast-compare";

import moment from "moment";

import {Button} from "react-bootstrap";

import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {ActiveUser} from "../../store/active-user/types";

import UserAvatar from "../user-avatar";
import Tooltip from "../tooltip";
import {Followers, Following} from "../friends";
import ProfileEdit from "../profile-edit";

import accountReputation from "../../helper/account-reputation";

import formattedNumber from "../../util/formatted-number";

import defaults from "../../constants/defaults.json";

import {vpMana} from "../../api/hive";

import {_t} from "../../i18n";

import {
    formatListBulledttedSvg,
    accountMultipleSvg,
    accountPlusSvg,
    nearMeSvg,
    earthSvg,
    calendarRangeSvg,
    rssSvg,
} from "../../img/svg";

interface Props {
    global: Global;
    history: History;
    activeUser: ActiveUser | null;
    account: Account;
    addAccount: (data: Account) => void;
    updateActiveUser: (data?: Account) => void;
}

interface State {
    followersList: boolean;
    followingList: boolean;
    profileEdit: boolean;
}

export class ProfileCard extends Component<Props, State> {
    state: State = {
        followersList: false,
        followingList: false,
        profileEdit: false
    };

    componentDidUpdate(prevProps: Readonly<Props>): void {
        // Hide dialogs when account change
        if (this.props.account.name !== prevProps.account.name) {
            this.setState({followersList: false});
            this.setState({followingList: false});
        }
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
        return !isEqual(this.props.account, nextProps.account)
            || !isEqual(this.props.activeUser, nextProps.activeUser)
            || !isEqual(this.state, nextState);
    }

    toggleFollowers = () => {
        const {followersList} = this.state;
        this.setState({followersList: !followersList});
    };

    toggleFollowing = () => {
        const {followingList} = this.state;
        this.setState({followingList: !followingList});
    };

    toggleProfileEdit = () => {
        const {profileEdit} = this.state;
        this.setState({profileEdit: !profileEdit});
    }

    render() {
        const {account, activeUser} = this.props;

        const vPower = account.__loaded ? vpMana(account) : 100;

        const isMyProfile = activeUser && activeUser.username === account.name && activeUser.data.profile;

        return (
            <div className="profile-card">
                <div className="profile-avatar">
                    {UserAvatar({...this.props, username: account.name, size: "xLarge"})}
                    {account.__loaded && <div className="reputation">{accountReputation(account.reputation!)}</div>}
                </div>

                <div className="username">{account.name}</div>

                <div className="vpower-line">
                    <div className="vpower-line-inner" style={{width: `${vPower}%`}}/>
                </div>

                <div className="vpower-percentage">
                    <Tooltip content={_t("profile.voting-power")}>
                        <span>{vPower.toFixed(2)}</span>
                    </Tooltip>
                </div>

                {(account.profile?.name || account.profile?.about) && (
                    <div className="basic-info">
                        {account.profile?.name && <div className="full-name">{account.profile.name}</div>}
                        {account.profile?.about && <div className="about">{account.profile.about}</div>}
                    </div>
                )}

                {account.__loaded && (
                    <div className="stats">
                        <div className="stat">
                            <Tooltip content={_t("profile.post-count")}>
                                <span>
                                    {formatListBulledttedSvg} {formattedNumber(account.post_count!, {fractionDigits: 0})}
                                </span>
                            </Tooltip>
                        </div>

                        {account.follow_stats?.follower_count !== undefined && (
                            <div className="stat followers">
                                <Tooltip content={_t("profile.followers")}>
                                    <span onClick={this.toggleFollowers}>
                                        {accountMultipleSvg} {formattedNumber(account.follow_stats.follower_count, {fractionDigits: 0})}
                                    </span>
                                </Tooltip>
                            </div>
                        )}

                        {account.follow_stats?.following_count !== undefined && (
                            <div className="stat following">
                                <Tooltip content={_t("profile.following")}>
                                    <span onClick={this.toggleFollowing}>
                                        {accountPlusSvg} {formattedNumber(account.follow_stats.following_count, {fractionDigits: 0})}
                                    </span>
                                </Tooltip>
                            </div>
                        )}
                    </div>
                )}

                <div className="extra-props">
                    {account.profile?.location && (
                        <div className="prop">
                            {nearMeSvg} {account.profile.location}
                        </div>
                    )}

                    {account.profile?.website && (
                        <div className="prop">
                            {earthSvg}
                            <a target="_external" className="website-link" href={account.profile.website}>
                                {account.profile.website}
                            </a>
                        </div>
                    )}

                    {account.created && (
                        <div className="prop">
                            {calendarRangeSvg} {moment(new Date(account.created)).format("LL")}
                        </div>
                    )}

                    <div className="prop">
                        {rssSvg}
                        <a target="_external" href={`${defaults.base}/@${account.name}/rss.xml`}>
                            RSS feed
                        </a>
                    </div>
                </div>

                {isMyProfile && (
                    <Button onClick={this.toggleProfileEdit}>{_t("profile.edit")}</Button>
                )}

                {this.state.followersList && <Followers {...this.props} account={account} onHide={this.toggleFollowers}/>}
                {this.state.followingList && <Following {...this.props} account={account} onHide={this.toggleFollowing}/>}
                {this.state.profileEdit && <ProfileEdit {...this.props} activeUser={activeUser!} onHide={this.toggleProfileEdit}/>}
            </div>
        );
    }
}

export default (p: Props) => {
    const props: Props = {
        global: p.global,
        history: p.history,
        activeUser: p.activeUser,
        account: p.account,
        addAccount: p.addAccount,
        updateActiveUser: p.updateActiveUser
    }

    return <ProfileCard {...props} />;
}

