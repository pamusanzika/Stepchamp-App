import SideNavBarItem from "./SideNavBarItem";
import { faBorderNone } from "@fortawesome/free-solid-svg-icons";
import { faGamepad } from "@fortawesome/free-solid-svg-icons";
import SideNavList from "./SideNavList/SideNavList";
const SideNavBarItemList = (props: any) => {
  return (
    <div className="nav-items-container">
      <SideNavBarItem
        name="Home"
        icon={faBorderNone}
        isCollapsed={props.isCollapsed}
        LinkTo="/"
      />
      <SideNavBarItem
        name="Challenges"
        icon={faGamepad}
        isCollapsed={props.isCollapsed}
        LinkTo="/challenges"
      />
      <SideNavList isCollapsed={props.isCollapsed} />
    </div>
  );
};

export default SideNavBarItemList;
