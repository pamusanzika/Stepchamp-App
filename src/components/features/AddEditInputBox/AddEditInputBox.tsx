import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { Col, Row } from 'react-bootstrap';
import "./AddEditInputBox.scss";
import DirtyValidationService from "../../../services/services-common/DirtyValidationService";

interface Props {
    data?: any;
    readOnly?: boolean;
    placeHolder?: string;
    showDeletingLoader?: boolean;
    showSavingLoader?: boolean;
    onInputChange?: any;
    onSave?: any;
    onDelete?: any;
    length?: number;
}

const AddEditInputBox = (props: Props) => {
    const [text, setText] = useState('');
    const [placeHolder, setPlaceHolder] = useState('');
    const [inputReadOnly, setInputReadOnly] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [textMaxLength, setTextMaxLength] = useState(1000);

    const inputRef = useRef<HTMLInputElement>(null);
    const _dirtyValidationService = DirtyValidationService.getInstance();

    useEffect(() => {
        if (props) {
            setText(props.data ? props.data.text : '');
            setInputReadOnly(props.readOnly ?? false);
            setPlaceHolder(props.placeHolder ?? '');
            setTextMaxLength(props.length ?? 1000);
            setIsEditMode(false);
        }
    }, [props]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            setInputReadOnly(false);
            setIsEditMode(false);
        };
        document.addEventListener("click", handleOutsideClick);
        return () => {
            document.removeEventListener("click", handleOutsideClick);
        };
    }, []);

    const onInputChange = (e: any) => {
        _dirtyValidationService.markFieldAsDirty('AddEditText');
        const newText = e.target.value;
        setInputReadOnly(false);
        setIsEditMode(true)
        setText(newText);
        if (props.onInputChange) {
            props.onInputChange(newText);
        }
    }

    const handleBlur = (e: any) => {
        setIsEditMode(false);
        setInputReadOnly(true);
        onSave(e);
    }

    const handleKeyPress = (e: any) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setInputReadOnly(true);
            setIsEditMode(false);
            e.target.blur();
        }
    }

    const onSave = async (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        _dirtyValidationService.markFieldAsDirty('AddEditText');
        event.stopPropagation();
        if (props.data) {
            let response = await props.onSave({ ...props.data, newText: text });
            if (!response) {
                setText(props.data.Name);
            }
        } else {
            let response = await props.onSave({ Id: 0, newText: text })
            if (!response) {
                setText(props.data.Name);
            }
        }
        setIsEditMode(false);
    }

    const onDelete = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        event.stopPropagation();
        props.onDelete(props.data);
    }

    return (
        <>
            <InputGroup className={`custom-inputGroup`}>
                <Form.Control
                    ref={inputRef}
                    type="text"
                    value={text}
                    maxLength={textMaxLength}
                    placeholder={placeHolder}
                    onChange={(e) => onInputChange(e)}
                    readOnly={inputReadOnly}
                    onKeyPress={handleKeyPress}
                    onBlur={handleBlur}
                    className="no-border custom-input"
                />

                {!isEditMode && (
                    <Row className="custom-icons-div">
                        <Col className="p-0"></Col>
                        <Col className="p-0 delete-ico">
                            <FontAwesomeIcon icon={faXmark} className='custom-icons' title="Delete" onClick={(e) => onDelete(e)} />
                        </Col>
                    </Row>
                )}
            </InputGroup>
        </>
    );
}

export default AddEditInputBox;