import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ links }) => {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            <span className="sidebar-icon">{link.icon}</span>
            <span className="sidebar-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
