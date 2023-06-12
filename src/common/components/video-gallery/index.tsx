import React, { useEffect, useState } from 'react'
import LinearProgress from '../linear-progress';
import PopoverConfirm from '../popover-confirm';
import { deleteForeverSvg, informationVariantSvg } from '../../img/svg';
import { Button, Modal, Tooltip } from 'react-bootstrap';
import { _t } from '../../i18n';
import "./index.scss"

const VideoGallery = (props: any) => {

  const {showGaller, setShowGallery, checkStat, selectedFile} = props;

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(()=> {
    getAllStatus();
  }, [])

  const getAllStatus = async () => {
    setLoading(true)
    const data = await checkStat()
    if (data){
      setItems(data)
      setLoading(false)
    }
  }

  const hideModal = () => {
    setShowGallery(false)
  }

  const formatTime = (dateStr: string | number | Date) => {
    const date: any = new Date(dateStr);
    const now: any = new Date();
  
    const difference = Math.abs(now - date);
    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

      if (years > 0) {
        if (years === 1) {
          return `${years} year ago`
        } else {          
          return `${years} years ago`;
        }
      } else if (months > 0) {
        if (months === 1) {
          return `${months} day ago`;
        } else {          
          return` ${months} months ago`;
        }
      } else if (days > 0) {
        if (days === 1) {
          return `${days} day ago`;
        } else {          
          return `${days} days ago`;
        }
      } else if (hours > 0) {
        if (hours === 1) {
          return `${hours} day ago`
        } else{
          return `${hours} hours ago`;
        }
      } else if (minutes > 0) {
        if (minutes === 1) {
          return `${minutes} day ago`
        } else {
          return `${minutes} minutes ago`;
        }
      } else {
        return `${seconds} seconds ago`;
      }
  }

  const filterListByStatus = async (action?: string) => {
    setLoading(true);
    const data = await checkStat();
    let filtered;

    if (action) {
      filtered = data.filter((video: any) => video.status === action);
      setLoading(false)
      return filtered;
    }

    if (!action) return data;

    setLoading(false);
  }

  const modalBodyTop = (
    <div className="video-status-picker">
      <Button variant="outline-primary" onClick={ async () =>{
        setItems(await filterListByStatus())
        }}>All</Button>

      <Button variant="outline-primary" onClick={async () =>{
        setItems(await filterListByStatus("published"))
        }}>Published</Button>

      <Button variant="outline-primary" onClick={ async () =>{
        setItems(await filterListByStatus("encoding_ipfs"))
        }}>Encoding</Button>

      <Button variant="outline-primary" onClick={ async () =>{
        setItems(await filterListByStatus("publish_manual"))
        }}>Encoded</Button>

      <Button variant="outline-primary" onClick={ async () =>{
        setItems(await filterListByStatus("encoding_failed"))
        }}>Failed</Button>
    </div>
  )

  const modalBody = (
    <div className="dialog-content">
        {loading && <LinearProgress />}
        {items?.length > 0 && (
          <div className="video-list">
           {items?.map((item: any) => {
          return (
          <div className="video-list-body">
            <div className="list-image">              
              <img src={item.thumbUrl} alt="" />
            </div>
            <div className="list-details-wrapper">
              <div className="list-title">
                <span className='details-title'>                  
                  {item.title.substring(0,15)}...
                </span>
                <span className="info-icon details-svg">
                  more...
                </span>
              </div>
              <div className="list-date">                
                <span>
                  {formatTime(item.created)}
                </span>
                {item.status === "publish_manual" ? <button>Publish</button> :
                item.status === "encoding_failed" ? <span className="encoding-failed">Encoding failed❌</span> :
                item.status === "published" ? <span className="published">Published✅</span> : 
                <span className="encoding">Encoding🟡</span>}
              </div>
            </div>
          </div>
          )
           })}
          </div>
        )}
        {!loading && items?.length === 0 && <div className="gallery-list">{_t("g.empty-list")}</div>}
    </div>
  )
  
  return (
    <>
      <Modal show={showGaller} centered={true} 
      onHide={() => setShowGallery(false)} 
      size="lg" className="gallery-modal">
        <Modal.Header closeButton={true}>
          <Modal.Title>Video {_t("gallery.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalBodyTop}
          {modalBody}
        </Modal.Body>
      </Modal>
    </>
  )
}

export default VideoGallery