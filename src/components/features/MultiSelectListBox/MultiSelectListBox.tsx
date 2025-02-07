import React, { useEffect, useState } from "react";
import "./MultiSelectListBox.scss";
import { objectArraySort } from "../../../utils/functions";

interface Prop {
    onChange: (selectedItems: number[]) => void;
    optionList: any[];
    multiSelect: boolean; 
    width?: string;
    selectedItemValue?: number;
}

const MultiSelectListBox = (props: Prop) => {
    const [selectedItemList, setSelectedItemList] = useState<number[]>(
        props.multiSelect ? [] : [props.selectedItemValue || 0]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(true);

    const [optionList, setOptionList] = useState<{ value: number; text: string; subText?: string }[]>([]);

    useEffect(() => {
        setOptionList(objectArraySort(props.optionList, 'text'));
        if(!props.multiSelect) {
            setSelectedItemList([props.selectedItemValue ?? 0]);
        } else {
            setSelectedItemList([]);
        }
    }, [props.optionList, props.selectedItemValue])
    
    // Item click event
    const handleOptionClick = (optionId: number) => {
        if (!props.multiSelect) {
            setSelectedItemList([optionId]);
            props.onChange([optionId]);
        }
        else if (selectedItemList.includes(optionId)) {
            setSelectedItemList(selectedItemList.filter((id) => id !== optionId));
            props.onChange(selectedItemList.filter((id) => id !== optionId))
        } else {
            setSelectedItemList([...selectedItemList, optionId]);
            props.onChange([...selectedItemList, optionId]);
            
        }

    };

    return (
        <div className={`custom-select-container ${props.width ?? 'width-100'} `}>
            {isDropdownOpen && (
                <div className="dropdown-options">
                    {optionList.map((op) => (
                        <div title={op.text}
                            key={op.value}
                            className={`option ${selectedItemList.includes(op.value) ? "selected" : ""}`}
                            onClick={() => handleOptionClick(op.value)}
                        >
                            {op.text}<br />
                            {op.subText ? <sub>{op.subText}</sub> : <></>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultiSelectListBox;
