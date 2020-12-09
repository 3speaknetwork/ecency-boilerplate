import React from "react";

import {Purchase} from "./index";

import {globalInstance, dynamicPropsIntance1} from "../../helper/test-helper";

import TestRenderer from "react-test-renderer";

const allOver = () => new Promise((resolve) => setImmediate(resolve));

jest.mock("../../api/private", () => ({
    calcPoints: () =>
        new Promise((resolve) => {
            resolve({"usd": 62.381282337, "estm": 31190.6411685});
        }),
}));

const defProps = {
    global: globalInstance,
    dynamicProps: dynamicPropsIntance1,
    users: [],
    activeUser: {
        username: 'foo',
        data: {
            name: 'foo',
            balance: '12.234 HIVE',
            sbd_balance: '4321.212',
            savings_balance: '2123.000 HIVE'
        },
        points: {
            points: "0.000",
            uPoints: "0.000"
        }
    },
    transactions: {
        list: [],
        loading: false,
        error: false
    },
    signingKey: '',
    addAccount: () => {
    },
    updateActiveUser: () => {
    },
    setSigningKey: () => {
    },
    onHide: () => {
    }
};

it("(1) Purchase", async () => {
    const renderer = TestRenderer.create(<Purchase {...defProps} />);
    await allOver();
    expect(renderer.toJSON()).toMatchSnapshot();
});


it("(2) Should switch to transfer", async () => {
    const component = TestRenderer.create(<Purchase {...defProps} />);
    await allOver();
    const instance: any = component.getInstance();

    instance.setState({submitted: true});
    expect(component.toJSON()).toMatchSnapshot();
});
