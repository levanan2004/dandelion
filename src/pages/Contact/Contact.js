import React from "react";

const Contact = () => (
  <>
    <div id="header-container"></div>
    <main
      className="main"
      style={{ padding: "20px 0 40px 0", background: "#F0F0F0" }}
    >
      <div className="container">
        <div
          className="contact-info"
          style={{ textAlign: "left", color: "#333", padding: "0 40px" }}
        >
          <h2 style={{ textAlign: "center" }}>Liên hệ ở Nhật Bản</h2>
          <ul>
            <li>
              <strong>Họ tên:</strong> Lê Tuấn Anh
            </li>
            <li>
              <strong>Số điện thoại:</strong> +81 080-6666-6523
            </li>
            <li>
              <strong>Facebook:</strong>
            </li>
            <li>
              <strong>Zalo:</strong> +84 0986-521-091
            </li>
          </ul>
          <br />
          <br />
          <ul>
            <li>
              <strong>Họ tên:</strong> Nguyễn Thiên Kim
            </li>
            <li>
              <strong>Số điện thoại:</strong> +81 090-4484-2772
            </li>
            <li>
              <strong>Facebook:</strong>
            </li>
            <li>
              <strong>Zalo:</strong> +84 0973-506-095
            </li>
          </ul>
          <br />
          <br />
          <h2 style={{ textAlign: "center" }}>Liên hệ ở Việt Nam</h2>
          <ul>
            <li>
              <strong>Họ tên:</strong> Nguyễn Thị Hoàng Yến
            </li>
            <li>
              <strong>Số điện thoại:</strong> +84 0975-544-169
            </li>
            <li>
              <strong>Facebook:</strong>
            </li>
            <li>
              <strong>Zalo:</strong> +84 0986-521-091
            </li>
          </ul>
        </div>
        <div
          className="contact-request"
          style={{ marginTop: 40, textAlign: "center" }}
        >
          <h2>Tin nhắn liên hệ</h2>
          <p
            style={{ fontSize: "1.4rem", marginBottom: 20, lineHeight: "2rem" }}
          >
            Cảm ơn bạn đã quan tâm đến chúng tôi. Hãy điền thông tin liên hệ
            dưới đây:
          </p>
          <div
            className="contact-form"
            style={{
              maxWidth: 500,
              margin: "0 auto",
              padding: 20,
              background: "#fff",
              borderRadius: 5,
              boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <form action="#" method="post">
              <label htmlFor="name">Họ và tên:</label>
              <input type="text" id="name" name="name" required />
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" name="email" required />
              <label htmlFor="message">Nội dung tin nhắn:</label>
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                style={{ resize: "vertical" }}
              ></textarea>
              <button type="submit">Gửi tin nhắn</button>
            </form>
          </div>
        </div>
      </div>
    </main>
    <div id="footer-container"></div>
  </>
);
export default Contact;
