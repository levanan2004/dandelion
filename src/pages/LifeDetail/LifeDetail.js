import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import apiGetTokenClient from "../../middleWare/getTokenClient";
import "../../styles/lifeDetail.css";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";
const getData = (res) => res?.data?.result ?? res?.data ?? [];
const toDisplayUrl = (url) =>
  !url
    ? "/images/placeholder.png"
    : /^https?:|^data:/.test(url)
    ? url
    : `${API}${url}`;
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

export default function LifeDetail() {
  const { id } = useParams();
  const lid = String(id || "").trim();

  const [life, setLife] = useState(null);
  const [images, setImages] = useState([]);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const [rl, ri, rc] = await Promise.all([
          apiGetTokenClient.get(`${API}/life`),
          apiGetTokenClient.get(`${API}/life-image`),
          apiGetTokenClient.get(`${API}/life-content`),
        ]);

        const all = getData(rl);
        const _life = all.find((x) => String(x.id) === lid) || null;
        setLife(_life);

        const ims = getData(ri).filter(
          (im) => String(im.life_id ?? im.lifeId) === lid
        );
        const cons = getData(rc).filter(
          (c) => String(c.life_id ?? c.lifeId) === lid
        );

        ims.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        cons.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

        setImages(ims);
        setContents(cons);
      } catch (e) {
        console.error(e);
        setErr(
          e?.response?.data?.message || "Không tải được dữ liệu bài Life."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [lid]);

  // Ghép theo thứ tự position, đan xen text/img
  const timeline = useMemo(() => {
    const ims = images.map((i) => ({ _type: "img", ...i }));
    const cons = contents.map((c) => ({ _type: "txt", ...c }));

    let i = 0,
      j = 0;
    const out = [];
    while (i < cons.length || j < ims.length) {
      const pc = cons[i]?.position ?? Infinity;
      const pi = ims[j]?.position ?? Infinity;

      if (pc <= pi) {
        out.push(cons[i]);
        i++;
        if (pc === pi && j < ims.length) {
          out.push(ims[j]);
          j++;
        }
      } else {
        out.push(ims[j]);
        j++;
      }
    }
    return out;
  }, [images, contents]);

  if (loading) return <div className="ld-container">Đang tải bài viết…</div>;
  if (err) return <div className="ld-container text-danger">{err}</div>;
  if (!life)
    return <div className="ld-container">Không tìm thấy bài viết.</div>;

  return (
    <div className="ld-container">
      {/* Breadcrumb */}
      <nav className="ld-breadcrumb">
        <Link to="/life" className="ld-bc-link">
          Cuộc sống
        </Link>
        <span className="ld-bc-sep">/</span>
        <span className="ld-bc-current">{life.title}</span>
      </nav>

      {/* Header */}
      <header className="ld-header card">
        <div className="card-body">
          <h1 className="ld-title">{life.title}</h1>
          <div className="ld-meta">
            {fmtDate(life.created_at)} • Bởi {life.author || "Tác giả"}
          </div>
          {life.tagline && <div className="ld-tagline">{life.tagline}</div>}
        </div>
      </header>

      {/* Body */}
      <article className="ld-article">
        {timeline.length === 0 && (
          <div className="card">
            <div className="card-body">Chưa có nội dung cho bài viết này.</div>
          </div>
        )}

        {timeline.map((item, idx) =>
          item._type === "txt" ? (
            <section key={`c-${idx}`} className="ld-block ld-content card">
              {item.title && <h3 className="ld-block-title">{item.title}</h3>}
              <div className="card-body">
                <div className="ld-content-body pre-wrap">
                  {item.content || ""}
                </div>
              </div>
            </section>
          ) : (
            <figure key={`i-${idx}`} className="ld-block ld-image card">
              <div className="card-body">
                <img
                  className="ld-img"
                  src={toDisplayUrl(item.imageUrl)}
                  alt={item.alt || life.title}
                  loading="lazy"
                />
                {(item.caption || item.alt) && (
                  <figcaption className="ld-caption">
                    {item.caption || item.alt}
                  </figcaption>
                )}
              </div>
            </figure>
          )
        )}
      </article>

      {/* Ghi chú/nguồn (tuỳ chọn) */}
      {life.note && (
        <aside className="ld-note">
          <strong>Lưu ý:</strong> {life.note}
        </aside>
      )}
    </div>
  );
}
