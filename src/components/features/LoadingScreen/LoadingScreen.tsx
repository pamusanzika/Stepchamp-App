import { Modal } from "react-bootstrap"
import RiseLoader from "react-spinners/RiseLoader"
import "./LoadingScreen.scss";

function LoadingScreen(props: { showLoadPopup: boolean | undefined; }) {
    return (
        <>
            <Modal
            show={props.showLoadPopup}
            size="sm"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            dialogClassName="load-modal"
        >
            <Modal.Body>
            <RiseLoader
                color="#23d856"
                loading={props.showLoadPopup}
                size={30}
                aria-label="Loading Spinner"
                data-testid="loader"
            />
            </Modal.Body>
        </Modal>
        </>
    )
}

export default LoadingScreen;