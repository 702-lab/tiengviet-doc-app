# 📚 Gia Sư Tập Đọc Lớp 1 (tiengviet-doc-app)

> Ứng dụng di động chéo nền tảng (iOS & Android) hỗ trợ học sinh lớp 1 học đánh vần, tập đọc trơn tiếng Việt chuẩn sư phạm theo cả giọng miền Bắc và miền Nam. Hỗ trợ trực quan khẩu hình và thủ ngữ cho trẻ khiếm thính hoặc chậm đọc chậm nói.

---

## 🌟 Tính Năng Nổi Bật (Features)

1. **Động cơ Đánh vần Tiếng Việt (Phonics Engine):** 
   * Tự động tách âm tiết bất kỳ thành: **Âm đầu (Onset)**, **Phần vần (Rhyme)** và **Thanh điệu (Tone)**.
   * Sinh công thức đánh vần trực quan chuẩn sư phạm (Ví dụ: `bàn` $\rightarrow$ *bờ - an - ban - huyền - bàn*).
2. **Đồng bộ Karaoke mức độ Chữ cái:**
   * Highlight từng cụm chữ cái tương thích thời gian thực với âm thanh phát ra.
3. **Luyện phát âm thông minh với AI (AI STT Assessment):**
   * Cho phép bé ghi âm giọng đọc trực tiếp. Sử dụng thuật toán so khớp con chung dài nhất (LCS) để đánh dấu từ đọc đúng (Xanh lá) hoặc đọc sai (Đỏ).
   * Giả lập 3 mức độ đọc (Đúng 100%, Sai một số từ, Sai nhiều từ) giúp phụ huynh dễ dàng kiểm thử.
4. **Phương ngữ Vùng miền (Dialect Support):**
   * Hỗ trợ phát âm và cách đánh vần khác biệt theo giọng Bắc và giọng Nam (Ví dụ: Chữ `v` phát âm "vờ" ở miền Bắc, "dờ" ở miền Nam; `r` phát âm "rờ" ở miền Bắc, "gờ" ở miền Nam).
   * Tự động định tuyến các giọng đọc hệ thống (Northern/Southern Voices).
5. **Trợ giúp Trực quan (Volunteer / Special Education):**
   * **VisualPhonics:** Hiển thị 3 hộp màu phân tách rõ rệt: Đỏ (Âm đầu) - Xanh lá (Phần vần) - Xanh dương (Thanh điệu).
   * **MouthSvg & HandSignSvg (Vector):** Hoạt họa khẩu hình miệng (khép miệng, mở rộng, cười dẹt, chu tròn) và outlines chữ cái thủ ngữ ngón tay theo chuẩn VSL (Ngôn ngữ ký hiệu Việt Nam).
6. **Chế độ Sáng/Tối (Light/Dark Mode Customization):**
   * Hỗ trợ đổi giao diện tối giúp chống mỏi mắt cho trẻ khi học tối, thiết kế Neumorphism tròn trịa thân thiện.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **Core Framework:** React Native với **Expo SDK 54** (TypeScript).
* **Quản lý Âm thanh & Ghi âm:** `expo-speech` (TTS) và `expo-av` (Microphone recording).
* **Hình ảnh Vector:** `react-native-svg` (vẽ tay thủ ngữ và khẩu hình miệng).
* **Kiểm thử (Testing):** **Vitest** (Unit & Integration tests).

---

## 📂 Cấu Trúc Thư Mục (Folder Structure)

```text
tiengviet-doc-app/
├── App.tsx                  # Điểm khởi đầu & định tuyến màn hình
├── CLAUDE.md                # Cẩm nang vận hành dành cho AI Agent
├── README.md                # Tài liệu hướng dẫn sử dụng này
├── package.json             # Danh sách thư viện phụ thuộc
├── src/
│   ├── components/          # Các Component giao diện dùng chung
│   │   ├── ControlPanel.tsx # Điều khiển phát/dừng, tốc độ, phương ngữ
│   │   ├── HandSignSvg.tsx  # Vẽ thủ ngữ ngón tay VSL (SVG)
│   │   ├── KaraokeText.tsx  # Hiển thị chữ lớn & tô màu chữ cái karaoke
│   │   ├── MouthSvg.tsx     # Vẽ hoạt họa khẩu hình phát âm (SVG)
│   │   ├── PracticePanel.tsx# Khung ghi âm & chấm điểm AI STT
│   │   ├── SignLanguage.tsx # Khối trợ giúp trực quan khiếm thính
│   │   └── VisualPhonics.tsx# Khối phân tách hộp âm tiết 3 màu
│   ├── context/
│   │   └── ReaderContext.tsx# Quản lý luồng âm thanh & karaoke toàn cục
│   ├── screens/
│   │   ├── HomeScreen.tsx   # Màn hình nhập văn bản & bài mẫu
│   │   └── ReaderScreen.tsx # Phòng học đọc tương tác
│   ├── services/
│   │   ├── audioManager.ts  # Bọc API expo-speech bằng Promise
│   │   └── phonicsEngine.ts # Bộ phân tích ngôn ngữ & vần Tiếng Việt
│   └── theme/
│       └── colors.ts        # Bảng màu thiết kế sáng/tối pastel
```

---

## 🚀 Khởi Chạy Dự Án (Getting Started)

### 1. Cài đặt thư viện phụ thuộc
Yêu cầu Node.js $\ge$ 18. Chạy lệnh sau tại thư mục dự án:
```bash
npm install
```

### 2. Chạy ứng dụng

#### Cách A: Chạy trên Thiết bị thực (iOS/Android) qua Expo Go (Khuyên dùng)
1. Khởi động Expo dev server:
   ```bash
   npx expo start --tunnel
   ```
   *Lưu ý: Flag `--tunnel` giúp kết nối thiết bị di động của bạn qua mạng Internet mà không cần chung mạng Wi-Fi với máy tính.*
2. Cài đặt ứng dụng **Expo Go** trên điện thoại từ App Store (iOS) hoặc Google Play (Android).
3. Mở Camera quét mã QR để tải và chạy trực tiếp ứng dụng trên điện thoại.

#### Cách B: Chạy trên Trình duyệt Web
1. Khởi động web dev server:
   ```bash
   npx expo start --web
   ```
2. Ứng dụng sẽ tự động hiển thị tại địa chỉ `http://localhost:8081`.

---

## 🧪 Hệ Thống Kiểm Thử (Testing)

Dự án sử dụng **Vitest** để đảm bảo tính ổn định và chính xác cao nhất cho Động cơ Đánh vần và các kịch bản so khớp chữ.

* **Chạy toàn bộ các ca kiểm thử (Unit & Integration tests):**
  ```bash
  npm run test
  ```
* **Chạy type check tĩnh:**
  ```bash
  npx tsc --noEmit
  ```
