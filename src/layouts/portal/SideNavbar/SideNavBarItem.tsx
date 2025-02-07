import "./SideNavBarItem.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
const SideNavBarItem = (props: any) => {
  const [isCollapsedChanged, setIsCollapsedChanged] = useState(false);
  useEffect(() => {
    if (!props.isCollapsed) {
      const timeoutId = setTimeout(() => {
        setIsCollapsedChanged(true);
      }, 300);

      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      setIsCollapsedChanged(false);
    }
  }, [props.isCollapsed]);
  return (
    <Link to={props.LinkTo} style={{ width: "95%", textDecoration: "none" }}>
      <Button className={`${props.btnclassName ? props.btnclassName : "side-nav-button"}`}>
        <div style={{ width: "20%" }}>
          <FontAwesomeIcon icon={props.icon} size="lg" />
        </div>
        {isCollapsedChanged ? (
          <div
            className={`navitem-name ${props.className ? props.className : ""}`}
          >
            {props.name}
          </div>
        ) : null}
      </Button>
    </Link>
  );
};

export default SideNavBarItem;
