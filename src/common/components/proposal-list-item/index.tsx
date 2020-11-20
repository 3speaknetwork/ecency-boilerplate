import React, {Component} from "react";

import {Link} from "react-router-dom";

import moment from "moment";

import numeral from "numeral";
import isEqual from "react-fast-compare";
import {History} from "history";

import {Proposal} from "../../api/hive";
import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";

import EntryLink from "../entry-link";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import ProposalVotes from "../proposal-votes";
import ProposalVoteBtn from "../proposal-vote-btn"

import parseAsset from "../../helper/parse-asset"

import {DynamicProps} from "../../store/dynamic-props/types";

import {_t} from "../../i18n";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {ToggleType, UI} from "../../store/ui/types";

interface Props {
    history: History;
    global: Global;
    dynamicProps: DynamicProps;
    users: User[];
    activeUser: ActiveUser | null;
    ui: UI;
    signingKey: string;
    addAccount: (data: Account) => void;
    proposal: Proposal;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data?: Account) => void;
    deleteUser: (username: string) => void;
    toggleUIProp: (what: ToggleType) => void;
    setSigningKey: (key: string) => void;
}

interface State {
    votes: boolean
}

export class ProposalListItem extends Component<Props, State> {
    state: State = {
        votes: false
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<{}>, nextContext: any): boolean {
        return !isEqual(this.state, nextState) ||
            !isEqual(this.props.activeUser?.username, nextProps.activeUser?.username) ||
            !isEqual(this.props.dynamicProps.hivePerMVests, nextProps.dynamicProps.hivePerMVests);
    }

    toggleVotes = () => {
        const {votes} = this.state;
        this.setState({votes: !votes});
    }

    render() {
        const {votes} = this.state;

        const {dynamicProps, proposal} = this.props;

        const startDate = moment(new Date(proposal.start_date));
        const endDate = moment(new Date(proposal.end_date));
        const duration = endDate.diff(startDate, 'days');

        const votesHP = (Number(proposal.total_votes) / 1e12) * dynamicProps.hivePerMVests;
        const strVotes = numeral(votesHP).format("0.00,") + " HP";

        const dailyPayment = parseAsset(proposal.daily_pay).amount;
        const strDailyHdb = numeral(dailyPayment).format("0.0a");

        const allPayment = dailyPayment * duration;
        const strAllPayment = numeral(allPayment).format("0.0a");

        return (
            <div className="proposal-list-item">
                <div className="left-side">
                    <div className="proposal-users-card">
                        {UserAvatar({
                            ...this.props,
                            username: proposal.creator,
                            size: "small"
                        })}
                        <span className="users">
                            {_t("proposals.by")}{" "}
                            {ProfileLink({
                                ...this.props,
                                username: proposal.creator,
                                children: <span> {proposal.creator}</span>
                            })}

                            {(proposal.receiver && proposal.receiver !== proposal.creator) && (
                                <>{" "}{_t("proposals.for")}{" "}
                                    {ProfileLink({
                                        ...this.props,
                                        username: proposal.receiver,
                                        children: <span> {proposal.receiver}</span>
                                    })}
                                </>
                            )}
                            </span>
                    </div>
                    <div className="proposal-title">
                        <Link to={`/proposals/${proposal.id}`}>
                            {proposal.subject} <span className="proposal-id">#{proposal.id}</span>
                        </Link>
                        {/*EntryLink({
                            ...this.props,
                            entry: {
                                category: "proposal",
                                author: proposal.creator,
                                permlink: proposal.permlink
                            },
                            children: <a>
                                {proposal.subject}
                                <span className="proposal-id">#{proposal.id}</span>
                            </a>
                        })*/}
                    </div>
                    <div className="proposal-info">
                        <div className="proposal-status active">active</div>
                        <div className="proposal-duration">
                            {startDate.format('ll')} {"-"} {endDate.format("ll")} ({_t("proposals.duration-days", {n: duration})})
                        </div>
                        <div className="proposal-payment">
                            <span className="all-pay">{`${strAllPayment} HBD`}</span>
                            <span className="daily-pay">({_t("proposals.daily-pay", {n: strDailyHdb})}{" "}{"HBD"})</span>
                        </div>
                    </div>
                    <div className="proposal-votes">
                        <a href="#" className="btn-votes" onClick={(e) => {
                            e.preventDefault();
                            this.toggleVotes();
                        }}>{_t("proposals.votes", {n: strVotes})}</a>
                    </div>
                </div>
                <div className="right-side">
                    {proposal.id === 0 && (
                        <span className="return-proposal">{_t("proposals.return-description")}</span>
                    )}
                    {proposal.id !== 0 && (
                        <>
                            <ProposalVoteBtn {...this.props} proposal={proposal.id}/>
                        </>
                    )}
                </div>

                {votes && <ProposalVotes {...this.props} onHide={this.toggleVotes}/>}
            </div>
        );
    }
}

export default (p: Props) => {
    const props = {
        global: p.global,
        history: p.history,
        dynamicProps: p.dynamicProps,
        users: p.users,
        activeUser: p.activeUser,
        ui: p.ui,
        signingKey: p.signingKey,
        addAccount: p.addAccount,
        setActiveUser: p.setActiveUser,
        updateActiveUser: p.updateActiveUser,
        deleteUser: p.deleteUser,
        toggleUIProp: p.toggleUIProp,
        setSigningKey: p.setSigningKey,
        proposal: p.proposal
    }

    return <ProposalListItem {...props} />;
}

