import { useEffect, useState, type FormEvent } from "react";
import { formatDate, moneda } from "../../lib/format";
import { valorLote } from "../../lib/ofertas";
import { MEDIOS_DE_PAGO, simularPago, type MedioDePago, type OperacionAprobada } from "../../lib/pasarela";
import { leerUsuario } from "../../lib/sesion";
import type { Lote } from "../../types";

type Fase = "formulario" | "procesando" | "confirmada";

// Compra simulada del lote: datos del comprador, medio de pago y confirmación. Ningún dato de pago real.
export function CompraLote({ lote, onCerrar }: { lote: Lote; onCerrar: () => void }) {
  const usuario = leerUsuario();
  const [fase, setFase] = useState<Fase>("formulario");
  const [nombre, setNombre] = useState(usuario ? `${usuario.nombre} ${usuario.apellido}` : "");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [medio, setMedio] = useState<MedioDePago>("transferencia");
  const [operacion, setOperacion] = useState<OperacionAprobada | null>(null);
  const [error, setError] = useState("");

  // Escape cierra el diálogo, salvo mientras se procesa el pago.
  useEffect(() => {
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape" && fase !== "procesando") onCerrar();
    };
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [fase, onCerrar]);

  const pagar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setError("");
    setFase("procesando");
    try {
      setOperacion(await simularPago({ loteId: lote.id, comprador: nombre, email, medio, monto: valorLote(lote) }));
      setFase("confirmada");
    } catch {
      setError("No se pudo procesar el pago simulado. Probá de nuevo.");
      setFase("formulario");
    }
  };

  return (
    <div className="compra-fondo" onClick={() => fase !== "procesando" && onCerrar()}>
      <section
        className="compra-dialogo"
        role="dialog"
        aria-modal="true"
        aria-labelledby="compraTitulo"
        onClick={(evento) => evento.stopPropagation()}
      >
        {fase === "confirmada" && operacion ? (
          <>
            <p className="eyebrow">COMPRA SIMULADA</p>
            <h2 id="compraTitulo">Compra registrada</h2>
            <p className="section-intro">
              El lote {lote.id} quedó reservado para {nombre}. Este pago es simulado: no se cobró dinero.
            </p>
            <dl className="compra-resumen">
              <div>
                <dt>Código de operación</dt>
                <dd>{operacion.operacion}</dd>
              </div>
              <div>
                <dt>Monto simulado</dt>
                <dd>{moneda.format(operacion.monto)}</dd>
              </div>
              <div>
                <dt>Medio</dt>
                <dd>{MEDIOS_DE_PAGO[operacion.medio]}</dd>
              </div>
              <div>
                <dt>Fecha</dt>
                <dd>{formatDate(new Date().toISOString().slice(0, 10))}</dd>
              </div>
            </dl>
            <div className="compra-acciones">
              <button className="button button-primary" type="button" onClick={onCerrar}>
                Volver a la oferta
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={pagar}>
            <p className="eyebrow">PAGO SIMULADO</p>
            <h2 id="compraTitulo">Comprar lote {lote.id}</h2>
            <p className="section-intro">
              {lote.titulo} · {lote.animales.length} animales · total {moneda.format(valorLote(lote))}
            </p>

            <label className="compra-campo">
              <span className="field-label">Nombre y apellido</span>
              <input type="text" value={nombre} onChange={(evento) => setNombre(evento.target.value)} required autoFocus />
            </label>
            <label className="compra-campo">
              <span className="field-label">Email</span>
              <input type="email" value={email} onChange={(evento) => setEmail(evento.target.value)} required />
            </label>
            <label className="compra-campo">
              <span className="field-label">Medio de pago</span>
              <select value={medio} onChange={(evento) => setMedio(evento.target.value as MedioDePago)}>
                {Object.entries(MEDIOS_DE_PAGO).map(([valor, texto]) => (
                  <option key={valor} value={valor}>
                    {texto}
                  </option>
                ))}
              </select>
            </label>

            <p className="form-hint">Pago simulado para el MVP: no se cobra dinero ni se pide un número de tarjeta.</p>
            <p className="form-message error" aria-live="polite">
              {error}
            </p>

            <div className="compra-acciones">
              <button className="button button-outline" type="button" onClick={onCerrar} disabled={fase === "procesando"}>
                Cancelar
              </button>
              <button className="button button-primary" type="submit" disabled={fase === "procesando"}>
                {fase === "procesando" ? "Procesando pago…" : `Pagar ${moneda.format(valorLote(lote))}`}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
