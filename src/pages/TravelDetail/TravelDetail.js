import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import apiGetTokenClient from "../../middleWare/getTokenClient";
import "../../styles/travelDetail.css";

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

export default function TravelDetail() {
  const { id } = useParams();
  const tid = String(id || "").trim();

  const [travel, setTravel] = useState(null);
  const [images, setImages] = useState([]);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const [rt, ri, rc] = await Promise.all([
          apiGetTokenClient.get(`${API}/travel`),
          apiGetTokenClient.get(`${API}/travel-image`),
          apiGetTokenClient.get(`${API}/travel-content`),
        ]);
        const allTravels = getData(rt);
        const t = allTravels.find((x) => String(x.id) === tid) || null;
        setTravel(t);

        const ims = getData(ri).filter(
          (im) => String(im.travel_id ?? im.travelId) === tid
        );
        const cons = getData(rc).filter(
          (c) => String(c.travel_id ?? c.travelId) === tid
        );
        // sort position ASC
        ims.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        cons.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

        setImages(ims);
        setContents(cons);
      } catch (e) {
        console.error(e);
        setErr(
          e?.response?.data?.message || "Không tải được dữ liệu bài Travel."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [tid]);

  // Trộn theo thứ tự position: content và image đan xen
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

  if (loading) return <div className="td-container">Đang tải bài viết…</div>;
  if (err) return <div className="td-container text-danger">{err}</div>;
  if (!travel)
    return <div className="td-container">Không tìm thấy bài viết.</div>;

  return (
    <div className="td-container">
      {/* Breadcrumb */}
      <nav className="td-breadcrumb">
        <Link to="/travel" className="td-bc-link">
          Du lịch
        </Link>
        <span className="td-bc-sep">/</span>
        <span className="td-bc-current">{travel.title}</span>
      </nav>

      {/* Header */}
      <header className="td-header card">
        <div className="card-body">
          <h1 className="td-title">{travel.title}</h1>
          <div className="td-meta">
            {fmtDate(travel.created_at)} • Bởi {travel.author || "Tác giả"}
          </div>
          {travel.location && (
            <div className="td-location">Địa điểm: {travel.location}</div>
          )}
        </div>
      </header>

      {/* Body: Nội dung ↔ Ảnh xen kẽ */}
      <article className="td-article">
        {timeline.length === 0 && (
          <div className="card">
            <div className="card-body">Chưa có nội dung cho bài viết này.</div>
          </div>
        )}

        {timeline.map((item, idx) =>
          item._type === "txt" ? (
            <section key={`c-${idx}`} className="td-block td-content card">
              {item.title && <h3 className="td-block-title">{item.title}</h3>}
              <div className="card-body">
                {/* giữ xuống dòng */}
                <div className="td-content-body pre-wrap">
                  {item.content || ""}
                </div>
              </div>
            </section>
          ) : (
            <figure key={`i-${idx}`} className="td-block td-image card">
              <div className="card-body">
                <img
                  className="td-img"
                  src={toDisplayUrl(item.imageUrl)}
                  alt={item.alt || travel.title}
                  loading="lazy"
                  width={200}
                />
                {(item.caption || item.alt) && (
                  <figcaption className="td-caption">
                    {item.caption || item.alt}
                  </figcaption>
                )}
              </div>
            </figure>
          )
        )}
      </article>

      {/* Footer note (tuỳ chọn) */}
      {travel.note && (
        <aside className="td-note">
          <strong>Lưu ý:</strong> {travel.note}
        </aside>
      )}
    </div>
  );
}
