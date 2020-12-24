import React, {Component} from "react";

import Datetime from "react-datetime";

import moment, {Moment} from "moment";

import {Button, Modal} from "react-bootstrap";

import {_t} from "../../i18n";

import {closeSvg} from "../../img/svg";

interface Props {
    date: Moment | null,
    onChange: (date: Moment | null) => void;
}

interface DialogBodyProps extends Props {
    onHide: () => void
}

interface DialogBodyState {
    date: Moment,
}

export const getTodayTs = () => moment().hour(0).minute(0).second(0).milliseconds(0).format("x");

export class DialogBody extends Component<DialogBodyProps, DialogBodyState> {
    state: DialogBodyState = {
        date: this.props.date || moment().add(2, "hour")
    }

    _mounted: boolean = true;

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    render() {
        const {date} = this.state;
        const todayTs = getTodayTs();

        return <>
            <div className="picker">
                <Datetime open={true}
                          input={false}
                          value={date}
                          timeFormat="HH:mm"
                          isValidDate={(d) => {
                              return d.format("x") >= todayTs
                          }}
                          onChange={(date) => {
                              this.setState({date: date as Moment});
                          }}
                />
            </div>
            <div className="text-center">
                <Button onClick={() => {
                    const {date} = this.state;
                    const {onChange, onHide} = this.props;
                    onChange(date);
                    onHide();
                }}>{_t("post-scheduler.btn-label")}</Button>
            </div>
        </>;
    }
}

interface State {
    visible: boolean
}

export class PostSchedulerDialog extends Component<Props, State> {
    state: State = {
        visible: false
    }

    toggle = () => {
        const {visible} = this.state;
        this.setState({visible: !visible});
    }

    reset = () => {
        this.props.onChange(null);
    }

    render() {
        const {visible} = this.state;
        const {date} = this.props;

        const dialog = visible ? <Modal onHide={this.toggle} show={true} centered={true} animation={false} className="post-scheduler-dialog">
            <Modal.Header closeButton={true}>
                <Modal.Title>{_t("post-scheduler.title")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <DialogBody {...this.props} onHide={this.toggle}/>
            </Modal.Body>
        </Modal> : null;

        if (date) {
            return <>
                <div className="post-scheduler-scheduled">
                    <span className="date" onClick={this.toggle}>{date.format("YYYY-MM-DD HH:mm")}</span>
                    <span className="reset-date" onClick={this.reset}>{closeSvg}</span>
                </div>
                {dialog}
            </>
        }

        return <>
            <Button size="sm" onClick={this.toggle}>{_t("post-scheduler.btn-label")}</Button>
            {dialog}
        </>;
    }
}

export default (p: Props) => {
    const props: Props = {
        date: p.date,
        onChange: p.onChange
    }

    return <PostSchedulerDialog {...props} />
}
