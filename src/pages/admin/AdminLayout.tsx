import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import type { User } from "@supabase/supabase-js";
import styles from "./Admin.module.css";

interface Props {
  user: User;
}

const NAV = [
  { to: "cosechas",      label: "🌿 Cosechas"      },
  { to: "pedidos",       label: "📋 Pedidos"        },
  { to: "clientes",      label: "👤 Clientes"       },
  { to: "configuracion", label: "⚙️ Configuración"  },
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
    </div>
  );
}
