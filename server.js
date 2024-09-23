const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Thiết lập multer để upload file vào thư mục /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Sử dụng express static để truy cập ảnh từ thư mục /uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static("public"));

// Route để vào trang Quản lý Ảnh
app.get("/gallery", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route để upload file
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  const filePath = `/uploads/${req.file.filename}`;
  res.send(
    `<p>Upload thành công! <a href="${filePath}" target="_blank">Xem ảnh</a></p>`
  );
});

// Route để lấy danh sách ảnh
app.get("/images", (req, res) => {
  fs.readdir("uploads", (err, files) => {
    if (err) {
      return res.status(500).send("Unable to scan directory.");
    }

    let imagesHTML = `
            <div class="container py-5">
                <h2 class="text-center mb-4">Danh sách ảnh đã upload</h2>
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Ảnh</th>
                            <th>Tên File</th>
                            <th>Loại File</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

    files.forEach((file) => {
      const fileType = path.extname(file).slice(1); // Lấy loại file từ đuôi file

      imagesHTML += `
                <tr>
                    <td><img src="/uploads/${file}" alt="${file}" style="width: 100px; height: auto;" /></td>
                    <td>${file}</td>
                    <td>${fileType}</td>
                    <td><a href="/uploads/${file}" class="btn btn-primary btn-sm" target="_blank">Xem ảnh</a></td>
                </tr>
            `;
    });

    imagesHTML += `
                    </tbody>
                </table>
            </div>
        `;

    res.send(imagesHTML);
  });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
