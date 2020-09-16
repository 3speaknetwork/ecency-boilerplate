import React, {Component} from "react";

import {History} from "history";

import isEqual from "react-fast-compare";

import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {ActiveUser} from "../../store/active-user/types";
import {Subscription} from "../../store/subscriptions/types";

import LinearProgress from "../linear-progress";
import Tag from "../tag";
import {error} from "../feedback";

import {getSubscriptions} from "../../api/bridge";

import {_t} from "../../i18n";


interface Props {
    global: Global;
    history: History;
    activeUser: ActiveUser | null;
    account: Account;
}

interface State {
    loading: boolean;
    items: Subscription[]
}

export class ProfileCommunities extends Component<Props, State> {
    state: State = {
        loading: true,
        items: []
    };

    _mounted: boolean = true;

    componentDidMount() {
        const {account} = this.props;
        getSubscriptions(account.name)
            .then(items => {
                this.stateSet({items});
            })
            .catch(() => error(_t('g.server-error')))
            .finally(() => this.stateSet({loading: false}));
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
        return !isEqual(this.props.account, nextProps.account)
            || !isEqual(this.props.activeUser, nextProps.activeUser)
            || !isEqual(this.state, nextState);
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    render() {
        const {items, loading} = this.state;

        return (
            <div className="profile-communities">

                {(() => {
                    if (loading) {
                        return <LinearProgress/>;
                    }

                    if (items.length === 0) {
                        return <>
                            <h2>{_t('profile.communities-title')}</h2>
                            <p className="text-muted">{_t('g.empty-list')}</p>
                        </>
                    }

                    return <>
                        <h2>{_t('profile.communities-title')}</h2>
                        <ul className="community-list">
                            {items.map((i, k) => {
                                return <li key={k}>{Tag({
                                    ...this.props,
                                    tag: i[0],
                                    type: "link",
                                    children: <span>{i[1]}</span>
                                })} <span className="user-role">{i[2]}</span></li>
                            })}
                        </ul>
                    </>
                })()}
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
    }

    return <ProfileCommunities {...props} />;
}

