import { useCallback, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { EstadoDatos } from "../components/EstadoDatos";
import { Layout } from "../components/Layout";
import { CompraLote } from "../components/lote/CompraLote";
import { ImagenLote } from "../components/lote/ImagenLote";
import { formatDate, moneda, numero } from "../lib/format";
import { buscarLote, pesoTotal, rangoPesoLote, tipoDeBovino, valorLote, visiblesPara } from "../lib/ofertas";
import { esVendedor } from "../lib/sesion";
import { useLotes } from "../lib/senasa";

export function LotePage() {
  const { loteId = "" } = useParams();
  const { lotes, error, recargar } = useLotes();
  const [comprando, setComprando] = useState(false);
  const cerrarCompra = useCallback(() => setComprando(false), []);
  const vendedor = esVendedor();
  if (!lotes) return <EstadoDatos error={error} />;
  const lote = buscarLote(visiblesPara(lotes, vendedor), loteId);
  if (!lote) return <Navigate to="/ofertas" replace />;
  const rango = rangoPesoLote(lote);

  return (
    <Layout>
      <nav className="breadcrumb" aria-label="Ubicación">
        <Link to="/ofertas">Todas las ofertas</Link>
        <span aria-hidden="true">/</span>
        <span>{lote.id}</span>
      </nav>

      <header className="oferta-head">
        <div>
          <p className="eyebrow">
            {lote.id} · PUBLICADO {formatDate(lote.publicado)}
          </p>
          <h2 tabIndex={-1}>{lote.titulo}</h2>
          <p className="section-intro">
            {lote.provincia} · {lote.productor} · destino {lote.frigorifico.nombre}
          </p>
        </div>
        <dl className="oferta-resumen">
          <div>
            <dt>Peso total estimado</dt>
            <dd>
              {numero.format(rango.min)}–{numero.format(rango.max)} kg
            </dd>
          </div>
          <div>
            <dt>Precio por kg</dt>
            <dd>{moneda.format(lote.precioKg)}</dd>
          </div>
          <div>
            <dt>Valor estimado</dt>
            <dd>{moneda.format(valorLote(lote))}</dd>
          </div>
        </dl>
        {!vendedor && (
          <button className="button button-primary comprar-lote" type="button" onClick={() => setComprando(true)}>
            Comprar lote
          </button>
        )}
      </header>

      {comprando && <CompraLote lote={lote} onCerrar={cerrarCompra} />}

      {lote.imagenUrl && <img className="lote-imagen" src={lote.imagenUrl} alt={`Foto del lote ${lote.titulo}`} />}
      {vendedor && <ImagenLote lote={lote} onSubida={recargar} />}

      <div className="table-wrap panel">
        <table>
          <thead>
            <tr>
              <th scope="col">Animal</th>
              <th scope="col">Tipo de bovino</th>
              <th scope="col">Peso estimado</th>
              <th scope="col">Identificación</th>
            </tr>
          </thead>
          <tbody>
            {lote.animales.map((animal) => (
              <tr key={animal.id}>
                <td>
                  <Link className="animal-link" to={`/ofertas/animal/${animal.id}`}>
                    {animal.id}
                  </Link>
                </td>
                <td>{tipoDeBovino(animal)}</td>
                <td>
                  {numero.format(animal.pesoMinKg)}–{numero.format(animal.pesoMaxKg)} kg
                </td>
                <td>{animal.identificacion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="disclaimer">
        Peso total de referencia: {numero.format(pesoTotal(lote))} kg. Los rangos son estimaciones, porque el peso de un animal vivo varía.
      </p>
    </Layout>
  );
}
