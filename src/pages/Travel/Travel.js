// src/pages/Travel/Travel.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiGetTokenClient from "../../middleWare/getTokenClient";
import TravelHomeSection from "../../components/TravelHomeSection";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";
const getData = (res) => res?.data?.result ?? res?.data ?? [];

export default function Travel() {
  const [travels, setTravels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await apiGetTokenClient.get(`${API}/travel`);
        setTravels(getData(r));
      } catch (e) {
        console.error(e);
        setErr(
          e?.response?.data?.message || "Không tải được danh sách Travel."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      {/* Main */}
      <main className="travel-main">
        <div className="container">
          {/* Sidebar: mục lục bài Travel */}
          <aside className="sidebar">
            {loading && <div className="small text-muted">Đang tải…</div>}
            {err && !loading && <div className="text-danger small">{err}</div>}

            {!loading && !err && (
              <ul className="travel-catalog">
                {travels.map((t) => (
                  <li key={t.id}>
                    <Link to={`/travel/${t.id}`}>{t.title}</Link>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* Nội dung chính: danh sách Travel với gallery 3 ảnh lớn */}
          <div className="main-content">
            <section className="pf-section travel-section">
              <div className="pf-head">
                <h2>Trải nghiệm du lịch tại Nhật Bản</h2>
                <Link className="pf-more" to="/travel">
                  Đọc thêm →
                </Link>
              </div>

              {/* Danh sách bài viết */}
              <TravelHomeSection title="" moreHref="/travel" limit={20} />
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
