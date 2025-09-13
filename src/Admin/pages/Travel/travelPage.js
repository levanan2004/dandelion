// src/pages/TravelPage.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import apiGetTokenClient from "../../../middleWare/getTokenClient";
import "../../styles/admin.css";

/** Base API đúng port 3001 */
const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";
const UPLOAD_URL =
  process.env.REACT_APP_UPLOAD_URL || `${API}/upload-image/travel`;

/** lấy data từ response (hỗ trợ {result:[]} hoặc mảng trực tiếp) */
const getData = (res) => res?.data?.result ?? res?.data ?? [];

/** render ảnh: nếu là relative (/Uploads/...) => ghép host 3001 */
const toDisplayUrl = (url) =>
  !url ? "" : /^https?:|^data:/.test(url) ? url : `${API}${url}`;

export default function TravelPage() {
  // ======= SOURCE DATA =======
  const [travels, setTravels] = useState([]);
  const [contents, setContents] = useState([]);
  const [images, setImages] = useState([]);

  // ======= SELECTED =======
  const [selectedTravel, setSelectedTravel] = useState("");

  // ======= FORMS: TRAVEL =======
  const [travelForm, setTravelForm] = useState({ title: "", author: "" });
  const [editingTravelId, setEditingTravelId] = useState("");

  // ======= FORMS: CONTENT =======
  const [contentForm, setContentForm] = useState({
    content: "",
    position: "",
  });
  const [editingContentId, setEditingContentId] = useState("");

  // ======= FORMS: IMAGES =======
  const [imgFiles, setImgFiles] = useState([]); // Array<File> (cộng dồn qua nhiều lần chọn)
  const [imgAlt, setImgAlt] = useState("");
  const [imgStartPos, setImgStartPos] = useState(0);

  // Preview cho ảnh đang chọn
  const [imgPreviews, setImgPreviews] = useState([]); // string[] objectURL

  // ======= UX =======
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const contentCardRef = useRef(null);
  const imageCardRef = useRef(null);

  // Tạo/cleanup objectURLs cho preview
  useEffect(() => {
    const urls = imgFiles.map((f) => URL.createObjectURL(f));
    setImgPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [imgFiles]);

  // ======= LOADERS =======
  const loadTravels = async () => {
    const res = await apiGetTokenClient.get(`${API}/travel`);
    setTravels(getData(res));
  };
  const loadContents = async () => {
    const res = await apiGetTokenClient.get(`${API}/travel-content`);
    setContents(getData(res));
  };
  const loadImages = async () => {
    const res = await apiGetTokenClient.get(`${API}/travel-image`);
    setImages(getData(res));
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await Promise.all([loadTravels(), loadContents(), loadImages()]);
      } catch (e) {
        console.error(e);
        setErr(
          `Không tải được dữ liệu (${e?.response?.status || "??"}). ${
            e?.response?.data?.message || e.message || ""
          }`
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ======= FILTERED =======
  const contentsOfSelected = useMemo(
    () =>
      contents
        .filter((c) => c.travel_id === selectedTravel)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    [contents, selectedTravel]
  );

  const imagesOfSelected = useMemo(
    () =>
      images
        .filter((im) => im.travel_id === selectedTravel)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    [images, selectedTravel]
  );

  // ======= TRAVEL CRUD =======
  const resetTravelForm = () => {
    setEditingTravelId("");
    setTravelForm({ title: "", author: "" });
  };

  const addOrUpdateTravel = async () => {
    const title = travelForm.title.trim();
    const author = (travelForm.author || "").trim();
    if (!title) return alert("Nhập tiêu đề bài Travel.");

    setLoading(true);
    setErr("");
    try {
      if (editingTravelId) {
        await apiGetTokenClient.put(`${API}/travel`, {
          id: editingTravelId,
          title,
          author,
        });
      } else {
        await apiGetTokenClient.post(`${API}/travel`, { title, author });
      }
      await loadTravels();
      resetTravelForm();
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || "Không lưu được bài Travel.");
    } finally {
      setLoading(false);
    }
  };

  const deleteTravel = async (id) => {
    if (!window.confirm("Xoá bài Travel này? (nội dung & ảnh sẽ bị xoá theo)"))
      return;
    setLoading(true);
    try {
      await apiGetTokenClient.delete(`${API}/travel`, { data: { id } });
      if (selectedTravel === id) setSelectedTravel("");
      await Promise.all([loadTravels(), loadContents(), loadImages()]);
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || "Không xoá được bài Travel.");
    } finally {
      setLoading(false);
    }
  };

  // ======= CONTENT CRUD =======
  const resetContentForm = () => {
    setEditingContentId("");
    setContentForm({ content: "", position: "" });
  };

  const addOrUpdateContent = async () => {
    if (!selectedTravel) return alert("Chọn bài Travel trước.");
    const content = (contentForm.content || "").trim();
    if (!content) return alert("Nhập nội dung.");
    const position = Number(contentForm.position ?? 0) || 0;

    setLoading(true);
    setErr("");
    try {
      if (editingContentId) {
        await apiGetTokenClient.put(`${API}/travel-content`, {
          id: editingContentId,
          travel_id: selectedTravel,
          content,
          position,
        });
      } else {
        await apiGetTokenClient.post(`${API}/travel-content`, {
          travel_id: selectedTravel,
          content,
          position,
        });
      }
      await loadContents();
      resetContentForm();
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || "Không lưu được nội dung.");
    } finally {
      setLoading(false);
    }
  };

  const deleteContent = async (id) => {
    if (!window.confirm("Xoá khối nội dung này?")) return;
    setLoading(true);
    try {
      await apiGetTokenClient.delete(`${API}/travel-content`, { data: { id } });
      await loadContents();
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || "Không xoá được nội dung.");
    } finally {
      setLoading(false);
    }
  };

  // ======= IMAGE CRUD =======

  const addImages = async () => {
    if (!selectedTravel) return alert("Chọn bài Travel trước.");
    if (!imgFiles?.length) return alert("Chọn ít nhất một file ảnh để upload.");

    setLoading(true);
    setErr("");
    try {
      let pos = Number(imgStartPos) || 0;

      for (const file of imgFiles) {
        const fd = new FormData();
        fd.append("image", file);
        const upRes = await axios.post(UPLOAD_URL, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const relativeUrl = upRes?.data?.imageUrl;
        if (relativeUrl) {
          await apiGetTokenClient.post(`${API}/travel-image`, {
            travel_id: selectedTravel,
            imageUrl: relativeUrl,
            alt: imgAlt ?? "",
            position: pos++,
          });
        }
      }

      await loadImages();
      // sau khi thêm, tăng startPos để lần sau tiếp nối
      setImgStartPos(pos);
      // xoá danh sách chọn, alt giữ nguyên cho tiện nếu muốn tiếp tục
      setImgFiles([]);
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || "Không thêm được ảnh.");
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (id) => {
    if (!window.confirm("Xoá ảnh này?")) return;
    setLoading(true);
    try {
      await apiGetTokenClient.delete(`${API}/travel-image`, { data: { id } });
      await loadImages();
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || "Không xoá được ảnh.");
    } finally {
      setLoading(false);
    }
  };

  // Xoá 1 ảnh khỏi danh sách đang chọn (preview) trước khi upload
  const removePendingAt = (index) => {
    setImgFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ======= UI =======
  return (
    <div className="admin-ui">
      <div className="ad-pm-container">
        <div className="ad-pm-header">
          <div>
            <div className="ad-pm-title">Quản lý Travel</div>
            <div className="ad-pm-subtle">
              {/* API base: <code>{API}</code> */}
            </div>
          </div>
        </div>

        {err && <div className="alert alert-danger ad-mb-3">{err}</div>}
        {loading && <div className="alert alert-info ad-mb-3">Đang xử lý…</div>}

        <div className="ad-pm-grid">
          {/* ===== LEFT: Bài Travel ===== */}
          <div className="ad-d-flex ad-flex-column ad-gap-12">
            <div className="card">
              <div className="card-header">Bài Travel</div>
              <div className="card-body">
                {/* Form thêm/cập nhật */}
                <div className="row g-2 ad-mb-3">
                  <div className="col-12 col-lg-5">
                    <input
                      className="form-control"
                      placeholder="Tiêu đề bài viết…"
                      value={travelForm.title}
                      onChange={(e) =>
                        setTravelForm((p) => ({ ...p, title: e.target.value }))
                      }
                    />
                  </div>
                  <div className="col-12 col-lg-3">
                    <input
                      className="form-control"
                      placeholder="Tác giả…"
                      value={travelForm.author}
                      onChange={(e) =>
                        setTravelForm((p) => ({ ...p, author: e.target.value }))
                      }
                    />
                  </div>
                  <div className="col-12 col-lg-4 ad-d-flex ad-gap-2">
                    <button
                      className="btn btn-primary flex-1"
                      onClick={addOrUpdateTravel}
                    >
                      {editingTravelId ? "Cập nhật" : "+ Thêm"}
                    </button>
                    {editingTravelId && (
                      <button
                        className="btn btn-light"
                        onClick={resetTravelForm}
                      >
                        Huỷ
                      </button>
                    )}
                  </div>
                </div>

                {/* Bảng danh sách Travel */}
                <div className="table-responsive life-table-wrap">
                  <table className="table table-sm align-middle life-table">
                    <thead>
                      <tr>
                        <th style={{ width: 56 }}>#</th>
                        <th>Tiêu đề</th>
                        <th style={{ width: 240 }}>Tác giả</th>
                        <th style={{ width: 170 }}>Ngày tạo</th>
                        <th className="text-end" style={{ width: 160 }}>
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {travels.length === 0 && (
                        <tr>
                          <td colSpan="5" className="ad-text-muted">
                            Chưa có bài Travel.
                          </td>
                        </tr>
                      )}

                      {travels.map((t, idx) => {
                        const isActive = selectedTravel === t.id;
                        return (
                          <tr
                            key={t.id}
                            className={isActive ? "ad-table-primary" : ""}
                            onClick={() => setSelectedTravel(t.id)}
                            style={{ cursor: "pointer" }}
                            title={`Tạo lúc: ${
                              t.created_at
                                ? new Date(t.created_at).toLocaleString("vi-VN")
                                : ""
                            }`}
                          >
                            <td>{idx + 1}</td>
                            <td className="life-title text-break">{t.title}</td>
                            <td className="life-author text-break">
                              {t.author || "—"}
                            </td>
                            <td className="text-nowrap">
                              {t.created_at
                                ? new Date(t.created_at).toLocaleString(
                                    "vi-VN",
                                    { hour12: false }
                                  )
                                : "—"}
                            </td>
                            <td className="text-end">
                              <div className="ad-pm-actions">
                                <button
                                  className="btn btn-warning btn-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingTravelId(t.id);
                                    setTravelForm({
                                      title: t.title || "",
                                      author: t.author || "",
                                    });
                                  }}
                                >
                                  Sửa
                                </button>
                                <button
                                  className="btn btn-danger btn-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTravel(t.id);
                                  }}
                                >
                                  Xoá
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {!selectedTravel && (
                  <div className="small ad-text-muted ad-mt-2">
                    Chọn một bài Travel trong bảng để quản lý nội dung & ảnh.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== RIGHT: Nội dung & Ảnh ===== */}
          <div className="ad-d-flex ad-flex-column ad-gap-12">
            {/* CONTENT CARD */}
            <div className="card" ref={contentCardRef}>
              <div className="card-header">Nội dung</div>
              <div className="card-body">
                <div className="row g-2 ad-mb-3">
                  <div className="col-12">
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder={
                        selectedTravel
                          ? "Nhập nội dung (markdown/text) cho bài đã chọn…"
                          : "Hãy chọn 1 bài Travel trước."
                      }
                      value={contentForm.content}
                      onChange={(e) =>
                        setContentForm((p) => ({
                          ...p,
                          content: e.target.value,
                        }))
                      }
                      disabled={!selectedTravel}
                    />
                  </div>
                  <div className="col-6 col-lg-3">
                    <input
                      className="form-control"
                      type="number"
                      placeholder="Vị trí"
                      value={contentForm.position}
                      onChange={(e) =>
                        setContentForm((p) => ({
                          ...p,
                          position: e.target.value,
                        }))
                      }
                      disabled={!selectedTravel}
                    />
                  </div>
                  <div className="col-6 col-lg-9 ad-d-flex ad-gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={addOrUpdateContent}
                      disabled={!selectedTravel}
                    >
                      {editingContentId ? "Cập nhật" : "+ Thêm khối"}
                    </button>
                    {editingContentId && (
                      <button
                        className="btn btn-light"
                        onClick={resetContentForm}
                      >
                        Huỷ
                      </button>
                    )}
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead>
                      <tr>
                        <th style={{ width: 56 }}>#</th>
                        <th style={{ width: 88 }}>Vị trí</th>
                        <th>Nội dung</th>
                        <th className="text-end" style={{ width: 160 }}>
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTravel && contentsOfSelected.length === 0 && (
                        <tr>
                          <td colSpan="4" className="ad-text-muted">
                            Chưa có nội dung.
                          </td>
                        </tr>
                      )}
                      {!selectedTravel && (
                        <tr>
                          <td colSpan="4" className="ad-text-muted">
                            Chọn một bài Travel để quản lý nội dung.
                          </td>
                        </tr>
                      )}
                      {contentsOfSelected.map((c, idx) => (
                        <tr key={c.id}>
                          <td>{idx + 1}</td>
                          <td>{c.position ?? 0}</td>
                          <td className="text-break">
                            {String(c.content || "").length > 300
                              ? `${String(c.content).slice(0, 300)}…`
                              : c.content || "—"}
                          </td>
                          <td className="text-end">
                            <div className="ad-pm-actions">
                              <button
                                className="btn btn-warning btn-xs"
                                onClick={() => {
                                  setEditingContentId(c.id);
                                  setContentForm({
                                    content: c.content || "",
                                    position: c.position ?? 0,
                                  });
                                }}
                              >
                                Sửa
                              </button>
                              <button
                                className="btn btn-danger btn-xs"
                                onClick={() => deleteContent(c.id)}
                              >
                                Xoá
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* IMAGE CARD */}
            <div className="card" ref={imageCardRef}>
              <div className="card-header">Ảnh</div>
              <div className="card-body">
                <div className="row g-2">
                  <div className="col-12 col-lg-6">
                    {/* Cộng dồn files qua nhiều lần chọn */}
                    <input
                      className="form-control"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const picked = Array.from(e.target.files || []);
                        if (!picked.length) return;

                        setImgFiles((prev) => {
                          const prevKeys = new Set(
                            prev.map(
                              (f) => `${f.name}_${f.size}_${f.lastModified}`
                            )
                          );
                          const add = picked.filter(
                            (f) =>
                              !prevKeys.has(
                                `${f.name}_${f.size}_${f.lastModified}`
                              )
                          );
                          return [...prev, ...add];
                        });

                        // cho phép chọn lại cùng file ngay sau đó
                        e.target.value = "";
                      }}
                      disabled={!selectedTravel}
                    />
                    <div className="form-text">
                      Có thể chọn nhiều lần, hệ thống sẽ cộng dồn ảnh (lọc
                      trùng).
                    </div>
                  </div>
                  <div className="col-12 col-lg-3">
                    <input
                      className="form-control"
                      placeholder="Alt cho ảnh"
                      value={imgAlt}
                      onChange={(e) => setImgAlt(e.target.value)}
                      disabled={!selectedTravel}
                    />
                  </div>
                  <div className="col-12 col-lg-3">
                    <input
                      className="form-control"
                      type="number"
                      placeholder="Vị trí bắt đầu"
                      value={imgStartPos}
                      onChange={(e) => setImgStartPos(e.target.value)}
                      disabled={!selectedTravel}
                    />
                  </div>
                </div>

                {/* PREVIEW ảnh đang chọn */}
                <div className="ad-mt-3">
                  <div className="ad-d-flex ad-gap-2 ad-align-center ad-flex-wrap">
                    <strong>Ảnh đang chọn:</strong>
                    <span className="ad-text-muted">
                      {imgFiles.length
                        ? `${imgFiles.length} ảnh`
                        : "Chưa chọn ảnh."}
                    </span>
                    {!!imgFiles.length && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-xs"
                        onClick={() => setImgFiles([])}
                      >
                        Xoá tất cả
                      </button>
                    )}
                  </div>

                  {!!imgFiles.length && (
                    <div
                      className="ad-mt-2"
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(110px, 1fr))",
                        gap: 12,
                      }}
                    >
                      {imgPreviews.map((src, i) => (
                        <div
                          key={src}
                          className="ad-pm-thumb"
                          title={imgFiles[i]?.name}
                          style={{ position: "relative" }}
                        >
                          <img
                            src={src}
                            alt={`pending-${i}`}
                            style={{
                              width: "100%",
                              aspectRatio: "1 / 1",
                              objectFit: "cover",
                              borderRadius: 10,
                              border: "1px solid #e5e7eb",
                            }}
                            loading="lazy"
                          />
                          <div
                            className="small ad-mt-1 text-truncate"
                            title={imgFiles[i]?.name}
                          >
                            {imgFiles[i]?.name}
                          </div>
                          <button
                            type="button"
                            className="btn btn-danger btn-xs"
                            style={{ width: "100%", marginTop: 6 }}
                            onClick={() => removePendingAt(i)}
                          >
                            Xoá ảnh này
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* END PREVIEW */}

                <div className="ad-mt-3">
                  <button
                    className="btn btn-success"
                    onClick={addImages}
                    disabled={!selectedTravel}
                  >
                    + Thêm ảnh{imgFiles.length ? ` (${imgFiles.length})` : ""}
                  </button>
                </div>

                {/* Danh sách ảnh đã có */}
                <div className="ad-d-flex ad-flex-wrap ad-gap-3 ad-mt-3">
                  {!selectedTravel && (
                    <span className="ad-text-muted">
                      Chọn một bài Travel để quản lý ảnh.
                    </span>
                  )}
                  {selectedTravel && imagesOfSelected.length === 0 && (
                    <span className="ad-text-muted">Chưa có ảnh.</span>
                  )}
                  {imagesOfSelected.map((im) => (
                    <div key={im.id} className="ad-pm-thumb">
                      <img src={toDisplayUrl(im.imageUrl)} alt={im.alt} />
                      <div
                        className="small ad-mt-1 text-truncate"
                        title={im.alt || ""}
                      >
                        {im.alt || (
                          <span className="ad-text-muted">No alt</span>
                        )}
                      </div>
                      <div className="ad-d-flex justify-content-between align-items-center ad-mt-1">
                        <span className="ad-badge text-bg-light">
                          #{im.position ?? 0}
                        </span>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteImage(im.id)}
                        >
                          Xoá
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* END IMAGE CARD */}
          </div>
          {/* ===== END RIGHT ===== */}
        </div>
      </div>
    </div>
  );
}
