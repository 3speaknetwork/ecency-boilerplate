import React, { useEffect, useState } from 'react'
import { Button, Modal } from "react-bootstrap";
import { _t } from "../../i18n";
import { findRcAccounts } from "../../api/hive";


export const ResourceCreditsInfo = (props: any) => {
    const [showRcInfo, setShowRcInfo] = useState(false);
    const [delegated, setDelegated] = useState();
    const [receivedDelegation, setReceivedDelegation] = useState();
    const [resourceCredit, setresourceCredit] = useState();

    const { rcPercent, account } = props;

    useEffect(() => {
        findRcAccounts(account.name).then((r) => {
            const delegated = r.map((a: any) => a.delegated_rc);
            setDelegated(delegated[0]);

            const availableResourceCredit: any = r.map((a: any) => a.rc_manabar.current_mana);
            setresourceCredit(availableResourceCredit);

            const receivedDel: any = r.map((a: any) => a.received_delegated_rc);
            setReceivedDelegation(receivedDel);
          })
    });

    const showModal = () => {
        setShowRcInfo(true);
    };

    const hideModal = () => {
        setShowRcInfo(false);
    };
  return (
    <div>
        <div className="progress" onClick={showModal}>
        <div
          className="progress-bar progress-bar-success"
          role="progressbar"
          style={{ width: `${rcPercent}%`,  cursor:"pointer" }}
        >
          {_t("rc-info.available")}
        </div>
        <div
          className="progress-bar progress-bar-danger"
          role="progressbar"
          style={{ width: `${100 - rcPercent}%`, cursor:"pointer" }}
        >
          {_t("rc-info.used")}
        </div>
      </div>
        <Modal
      animation={false}
      show={showRcInfo}
      centered={true}
      onHide={hideModal}
      keyboard={false}
      className="purchase-qr-dialog"
    >
      <Modal.Header closeButton={true}>
        <Modal.Title>
          <span className="d-flex justify-content-center">
            {_t("rc-info.resource-credits")}
          </span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{_t("rc-info.resource-credit")} {resourceCredit}</p>
        <p>{_t("rc-info.rc-available")} {`${rcPercent}%`}</p>
        <p>{_t("rc-info.rc-used")} {`${(100 - rcPercent).toFixed(2)}%`}</p>
        <p>{_t("rc-info.delegated")} {delegated}</p>
        <p>{_t("rc-info.received-delegations")} {receivedDelegation}</p>
        <div className="d-flex justify-content-center">
            <Button>
             {_t("rc-info.delegation-button")}
            </Button> 
        </div>
      </Modal.Body>
    </Modal>
    </div>
  );
};
