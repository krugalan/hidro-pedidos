import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Cliente } from "../../types/entities";
import styles from "./Admin.module.css";

const formatFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });

type FormMode = "crear" | "editar";

export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pedidosMap, setPedidosMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [formNombre, setFormNombre] = useState("");
  const [formWa, setFormWa] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState("");

  const cargar = async () => {
    const [{ data: cs }, { data: ps }] = await Promise.all([
      supabase.from("clientes").select("*"),
      supabase
        .from("pedidos")
        .select("cliente_id")
        .eq("estado", "entregado")
        .not("cliente_id", "is", null),
    ]);

    const map: Record<string, number> = {};
    for (const p of ps ?? []) {
      if (p.cliente_id) map[p.cliente_id] = (map[p.cliente_id] ?? 0) + 1;
    }
    setPedidosMap(map);

    const sorted = [...(cs ?? [])].sort(
      (a, b) => (map[(b as Cliente).id] ?? 0) - (map[(a as Cliente).id] ?? 0)
    );
    setClientes(sorted as Cliente[]);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => {
    setFormNombre(""); setFormWa(""); setFormEmail("");
    setEditId(null); setErrorForm(""); setFormMode("crear");
  };

  const abrirEditar = (c: Cliente) => {
    setFormNombre(c.nombre);
    setFormWa(c.whatsapp ?? "");
    setFormEmail(c.email ?? "");
    setEditId(c.id); setErrorForm(""); setFormMode("editar");
  };

  const cerrarForm = () => setFormMode(null);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true); setErrorForm("");
    const datos = {
      nombre: formNombre.trim(),
      whatsapp: formWa.trim() || null,
      email: formEmail.trim() || null,
    };
    let err;
    if (formMode === "crear") {
      ({ error: err } = await supabase.from("clientes").insert(datos));
    } else {
      ({ error: err } = await supabase.from("clientes").update(datos).eq("id", editId!));
    }
    if (err) { setErrorForm(err.message); }
    else { cerrarForm(); await cargar(); }
    setGuardando(false);
  };

  const filtrados = clientes.filter(
    (c) =>
      busqueda === "" ||
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.email ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.whatsapp ?? "").includes(busqueda)
  );

  if (loading) return <div className={styles.estado}>Cargando clientes…</div>;

  return (
    <div className={styles.paginaWide}>
      <div className={styles.paginaClientesTop}>
        <div className={styles.paginaHeaderRow}>
          <h1 className={styles.paginaTitulo}>
            Clientes <span className={styles.badge}>{clientes.length}</span>
          </h1>
          {formMode === null && (
            <button className={styles.btnPrimario} onClick={abrirCrear}>+ Nuevo cliente</button>
          )}
        </div>
        <input
          type="text"
          className={styles.input}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, email o WhatsApp…"
        />
      </div>

      {formMode && (
        <div className={styles.card} style={{ marginBottom: "1rem" }}>
          <h2 className={styles.cardTitulo}>
            {formMode === "crear" ? "Nuevo cliente" : "Editar cliente"}
          </h2>
          <form onSubmit={guardar} className={styles.form}>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="cli-nombre">Nombre</label>
              <input
                id="cli-nombre"
                className={styles.input}
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                required
                placeholder="Ej: Laura Gómez"
                autoFocus
              />
            </div>
            <div className={styles.formFila}>
              <div className={styles.campo}>
                <label className={styles.label} htmlFor="cli-wa">
                  WhatsApp <span className={styles.opcional}>(opcional)</span>
                </label>
                <input
                  id="cli-wa"
                  className={styles.input}
                  value={formWa}
                  onChange={(e) => setFormWa(e.target.value)}
                  placeholder="5491138860680"
                />
              </div>
              <div className={styles.campo}>
                <label className={styles.label} htmlFor="cli-email">
                  Email <span className={styles.opcional}>(opcional)</span>
                </label>
                <input
                  id="cli-email"
                  type="email"
                  className={styles.input}
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>
            </div>
            {errorForm && <p className={styles.errorMsg}>{errorForm}</p>}
            <div className={styles.formBotones}>
              <button type="submit" className={styles.btnPrimario} disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar"}
              </button>
              <button type="button" className={styles.btnSecundario} onClick={cerrarForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {filtrados.length === 0 ? (
        <p className={styles.estado}>
          {clientes.length === 0 ? "No hay clientes todavía." : "Sin resultados para esa búsqueda."}
        </p>
      ) : (
        <div className={styles.tablaClientesWrap}>
          <div className={styles.tablaClientesHeader}>
            <span>Nombre</span>
            <span>WhatsApp</span>
            <span>Email</span>
            <span className={styles.tablaClientesCentrado}>Entregados</span>
            <span>Registro</span>
          </div>
          {filtrados.map((c) => {
            const count = pedidosMap[c.id] ?? 0;
            return (
              <div key={c.id} className={styles.tablaClientesFila}>
                <span className={styles.tablaCliente}>{c.nombre}</span>
                <span>{c.whatsapp ?? "—"}</span>
                <span>{c.email ?? "—"}</span>
                <span className={styles.tablaClientesCentrado}>
                  <span className={`${styles.pedidosBadge} ${count > 0 ? styles.pedidosBadgeActivo : ""}`}>
                    {count > 0 ? count : "—"}
                  </span>
                </span>
                <span className={styles.tablaClientesAccion}>
                  <span className={styles.tablaSec}>{formatFecha(c.created_at)}</span>
                  <button
                    type="button"
                    className={styles.btnSecundario}
                    style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
                    onClick={() => abrirEditar(c)}
                  >
                    Editar
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
