import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { Col, Form, InputGroup, Row } from "react-bootstrap";
import './AddDeleteInputBox.scss';

interface Props {
    data?: any;
    type?: string;
    readOnly?: boolean;
    placeHolder?: string;
    onInputChange?: any;
    onSave?: any;
    onDelete?: any;
    onCancel?: any;
    length?: number;
    hidden?: boolean;
}

const AddDeleteInpputBox = (props: Props) => {

    const [text, setText] = useState('');
    const [type, setType] = useState('text');
    const [placeHolder, setPlaceHolder] = useState('');
    const [inputReadOnly, setInputReadOnly] = useState(false);
    const [textMaxLength, setTextMaxLength] = useState(1000);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (props) {
            setText(props.data ? props.data.text : '');
            setType(props.type ?? 'text');
            setInputReadOnly(props.readOnly ?? false);
            setPlaceHolder(props.placeHolder ?? '');
            setTextMaxLength(props.length ?? 1000);
        }
    }, [props]);

    const onInputChange = (e: any) => {
        const newText = e.target.value;
        setText(newText);
        if(props.onInputChange)
            props.onInputChange(newText);
    }

    const onSave = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            props.onSave();
        }
    }

    const onDelete = () => {
        props.onDelete(props.data);
    }

    const onCancel = () => {
        props.onCancel();
    }

    return (
        <>
            <InputGroup className={`custom-inputGroup ${!inputReadOnly ? 'solid-border-box' : ''}`}>
                <Form.Control 
                        ref={inputRef}
                        type={type}
                        value={text}
                        maxLength={textMaxLength}
                        placeholder={placeHolder}
                        onChange={(e) => onInputChange(e)}
                        onKeyDown={onSave}
                        readOnly={inputReadOnly}
                        className="no-border custom-input"
                />

                { inputReadOnly && (
                    <Row className="custom-icons-div">
                        <Col className="p-0"></Col>
                        <Col className="p-0 delete-ico" hidden={props.hidden}>
                            <FontAwesomeIcon icon={faXmark} className='custom-icons' title="Delete" onClick={()=>onDelete()}  />
                        </Col>
                    </Row>
                )}
                
            </InputGroup>
        </>
    );
}

export default AddDeleteInpputBox;