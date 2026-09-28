import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import type { User } from "@supabase/supabase-js";
import styles from "./Admin.module.css";

interface Props {
  user: User;
}

const NAV = [
  { to: "/admin/cosechas",      label: "🌿 Cosechas",     short: "🌿"  },
  { to: "/admin/productos",     label: "🥬 Productos",    short: "🥬"  },
  { to: "/admin/pedidos",       label: "📋 Pedidos",      short: "📋"  },
  { to: "/admin/clientes",      label: "👤 Clientes",     short: "👤"  },
  { to: "/admin/configuracion", label: "⚙️ Config",       short: "⚙️"  },
];

export function AdminLayout({ user }: Props) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarEmoji}>🌱</span>
          <span className={styles.sidebarTitle}>Hidro Admin</span>
        </div>

        <nav className={styles.nav}>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActivo : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.sidebarUser}>{user.email}</span>
          <button className={styles.btnLogout} onClick={handleLogout}>
            Salir
          </button>
        </div>
      </aside>

      <main className={styles.contenido}>
        <Outlet />
      </main>

      {/* Bottom nav — solo visible en mobile */}
      <nav className={styles.bottomNav}>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.bottomNavLink} ${isActive ? styles.bottomNavLinkActivo : ""}`
            }
          >
            <span className={styles.bottomNavEmoji}>{item.short}</span>
            <span className={styles.bottomNavLabel}>{item.label.replace(/^[^\s]+\s/, "")}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
