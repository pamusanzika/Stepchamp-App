import React, { useEffect, useState } from "react";
import "./SideNavList.scss";
import SideNavBarItem from "../SideNavBarItem";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { LocalStorageKeys } from "../../../../utils/constants";

const SideNavList = (props: any) => {
  const [isCollapsedChanged, setIsCollapsedChanged] = useState(false);
  const [isSysAdmin, setIsSysAdmin] = useState(false);

  const checkLoggedInUser = () => {
    const userSessionId = localStorage.getItem(LocalStorageKeys.sessionId);
    if (!userSessionId || userSessionId === 'undefined') {
      setIsSysAdmin(false);
    } else {
      const userData: any = localStorage.getItem(LocalStorageKeys.user);
      const userJson = JSON.parse(userData);
      if (userJson.AccessLevel !== 'SysAdmin') {
        setIsSysAdmin(false);
      } else {
        setIsSysAdmin(true);
      }
    }
  }

  useEffect(() => {
    checkLoggedInUser();
  }, [isSysAdmin]);

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

  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSettings = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div style={{ width: "95%" }}>
      <Button className="settings-list-toggle" onClick={toggleSettings}>
        <div style={{ width: "20%" }}>
          <FontAwesomeIcon icon={faGear} size="lg" />
        </div>
        {isCollapsedChanged ? (
          <div className="navitem-name">Settings</div>
        ) : null}
      </Button>
      <div
        className={`settings-list-item  settings-list ${
          isExpanded ? "show" : ""
        }`}
      >
        <SideNavBarItem
          name="Account"
          icon={faArrowRight}
          isCollapsed={props.isCollapsed}
          btnclassName='side-nav-sub-button'
        />
        {isSysAdmin && 
          <SideNavBarItem
            name="Manage Users"
            icon={faArrowRight}
            isCollapsed={props.isCollapsed}
            LinkTo="manage-users"
            btnclassName='side-nav-sub-button'
          />
        }
        {isSysAdmin && 
          <SideNavBarItem
            name="Activity Logs"
            icon={faArrowRight}
            isCollapsed={props.isCollapsed}
            LinkTo="activity-logs"
            btnclassName='side-nav-sub-button'
          />
        }
      </div>
    </div>
  );
};

export default SideNavList;
