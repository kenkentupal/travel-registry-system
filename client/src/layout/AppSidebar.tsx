import { useCallback } from "react";
import { Link, useLocation } from "react-router";
import {
  CalenderIcon,
  GridIcon,
  GroupIcon,
  MailIcon,
  UserCircleIcon,
  VehicleIcon,
  TaskIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useUser } from "../hooks/useUser";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; icon?: React.ReactNode }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [{ name: "Dashboard", path: "/", icon: <TaskIcon /> }],
  },
  {
    icon: <UserCircleIcon />,
    name: "User Management",
    subItems: [
      { name: "Invites", path: "/user-invites", icon: <MailIcon /> },
      { name: "User List", path: "/list", icon: <GroupIcon /> },
    ],
  },
  {
    name: "Vehicles",
    path: "/vehicles",
    icon: <VehicleIcon />,
  },
  {
    name: "Organizations",
    path: "/organizations",
    icon: <GroupIcon />,
  },
  {
    icon: <CalenderIcon />,
    name: "Calendar",
    path: "/calendar",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user } = useUser();
  const location = useLocation();

  const filterByRole = (items: NavItem[]) => {
    if (!user) return [];

    const allowedRoutes = {
      CEO: "all",
      President: "all",
      Developer: "all",
      Member: ["/", "/vehicles"],
      Driver: ["/", "/vehicles"],
    };

    const allowed = allowedRoutes[user.position as keyof typeof allowedRoutes];

    return items
      .map((item) => {
        // For subItems
        if (item.subItems) {
          const filteredSubs = item.subItems.filter((sub) =>
            allowed === "all" ? true : allowed.includes(sub.path)
          );
          return filteredSubs.length > 0
            ? { ...item, subItems: filteredSubs }
            : null;
        }

        // For direct items
        if (item.path) {
          return allowed === "all" || allowed.includes(item.path) ? item : null;
        }

        return null;
      })
      .filter(Boolean) as NavItem[];
  };

  const showText = isExpanded || isHovered || isMobileOpen;

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const renderMenuItems = (items: NavItem[], title: string) => (
    <div className="mb-6">
      {showText && (
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-2 px-2">
          {title}
        </h2>
      )}
      <ul className="flex flex-col gap-1">
        {items.map((nav) => {
          const baseLinkStyle = `flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition hover:bg-gray-100 dark:hover:bg-gray-800`;
          const activeStyle = `bg-gray-100 text-brand-600 dark:bg-gray-800`;
          const inactiveStyle = `text-gray-700 dark:text-gray-300`;

          if (nav.subItems) {
            return nav.subItems.map((subItem) => (
              <li key={subItem.name}>
                <Link
                  to={subItem.path}
                  className={`${baseLinkStyle} ${
                    isActive(subItem.path) ? activeStyle : inactiveStyle
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center">
                    {subItem.icon}
                  </span>
                  {showText && (
                    <span className="whitespace-nowrap">{subItem.name}</span>
                  )}
                </Link>
              </li>
            ));
          }

          return (
            <li key={nav.name}>
              <Link
                to={nav.path!}
                className={`${baseLinkStyle} ${
                  isActive(nav.path!) ? activeStyle : inactiveStyle
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center">
                  {nav.icon}
                </span>
                {showText && (
                  <span className="whitespace-nowrap">{nav.name}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  const sidebarWidth =
    isExpanded || isMobileOpen || isHovered ? "w-[290px]" : "w-[90px]";
  const sidebarTranslate = isMobileOpen ? "translate-x-0" : "-translate-x-full";

  return (
    <aside
      className={`fixed mt-16 lg:mt-0 top-0 left-0 z-50 h-screen bg-white dark:bg-gray-900 border-r dark:border-gray-800 border-gray-200 text-gray-900 transition-all duration-300 ease-in-out px-5 ${sidebarWidth} ${sidebarTranslate} lg:translate-x-0 flex flex-col`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      {/* Logo */}
      <div className="py-8 flex justify-center">
        <Link to="/">
          {showText ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/tvtap_logo.svg"
                alt="Logo"
                width={100}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/tvtap_logo.svg"
                alt="Logo"
                width={100}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/tvtap_logo.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      {/* Menu */}
      <div className="flex flex-col overflow-y-auto no-scrollbar duration-300 ease-linear">
        <nav>
          <div className="flex flex-col gap-4">
            {renderMenuItems(filterByRole(navItems), "Management")}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
