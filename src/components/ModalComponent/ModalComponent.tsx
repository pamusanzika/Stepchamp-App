import React, { ReactNode, useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import './ModalComponent.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  headerRequired?: boolean;
  title?: string;
  footerRequired?: boolean;


}

const ModalComponent: React.FC<ModalProps> = ({ isOpen, onClose, children, headerRequired = false, title= "", footerRequired= false }) => {
  
  const [isHeaderNeeded, setIsHeaderNeeded] = useState(false);
  const [isFooterNeeded, setIsFooterNeeded] = useState(false);
  const [headerTitle, setHeaderTitle] = useState('');

  useEffect(() => {
    if(headerRequired){
      setIsHeaderNeeded(true);
      setHeaderTitle(title);
    }
    if(footerRequired){
      setIsFooterNeeded(true);
    }
  }, [headerRequired, footerRequired]);
  
  
  
  return ( 
    <Modal show={isOpen} onHide={onClose} centered>
      {isHeaderNeeded ? ( 
        <Modal.Header closeButton  className='modal-header'>
          <Modal.Title className='header-title'>{headerTitle}</Modal.Title>
        </Modal.Header>) : (
          <></>
        )}
      
     
      <Modal.Body>{children}</Modal.Body>


      {isFooterNeeded ? (
         <Modal.Footer>
         <Button variant="secondary" onClick={onClose}>
           Close
         </Button>
       </Modal.Footer>
      ) : (
        <></>
      )}

    </Modal>
  );
};

export default ModalComponent;