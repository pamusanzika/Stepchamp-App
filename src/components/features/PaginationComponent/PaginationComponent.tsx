import { Pagination } from "react-bootstrap";
import './PaginationComponent.scss';

function PaginationComponent(props: any) {
    let pages = [];

    const pushPaginationItem = (start: number, end: number) => {
        let items = [];
        for (let index = Math.max(1, start); index <= Math.min(props.noOfPages, end); index++) {
            items.push(
                <Pagination.Item key={index} active={index === props.currentPage} onClick={() => {props.onPageChange(index)}}>{index}</Pagination.Item>
            );
        }
        return items;
    }

    if (props.currentPage === 1) {
        pages.push(...pushPaginationItem(1, 3));
    } else if (props.currentPage === props.noOfPages) {
        pages.push(...pushPaginationItem(props.noOfPages - 2, props.noOfPages));
    } else {
        pages.push(...pushPaginationItem(props.currentPage - 1, props.currentPage + 1));
    }

    return (
        <>
            <Pagination className="justify-content-center">
                <Pagination.First onClick={() => {props.onPageChange(1)}} disabled = {props.currentPage === 1} />
                <Pagination.Prev onClick={() => {props.onPageChange(props.currentPage - 1)}} disabled = {props.currentPage === 1} />
                {pages}
                <Pagination.Next onClick={() => {props.onPageChange(props.currentPage + 1)}} disabled = {props.currentPage === props.noOfPages} />
                <Pagination.Last onClick={() => {props.onPageChange(props.noOfPages)}} disabled = {props.currentPage === props.noOfPages} />
            </Pagination>
        </>
    )
}

export default PaginationComponent;