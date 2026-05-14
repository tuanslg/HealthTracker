# HealthTracker

HealthTracker là một ứng dụng theo dõi sức khỏe đa nền tảng được xây dựng bằng **React Native** và **Expo**. Ứng dụng giúp người dùng theo dõi các chỉ số sức khỏe, hiển thị biểu đồ thống kê và kết nối dữ liệu sức khỏe trực tiếp từ thiết bị (Apple Health / Android Health Connect).

## 🚀 Công nghệ sử dụng

- **Framework**: [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) (với Expo Router)
- **UI & Styling**: [NativeWind](https://www.nativewind.dev/) (TailwindCSS) & [Lucide Icons](https://lucide.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Database**: `expo-sqlite`
- **Biểu đồ**: `react-native-gifted-charts`
- **Đa ngôn ngữ (i18n)**: `react-i18next` & `i18next`
- **Kết nối dữ liệu sức khỏe**: 
  - **iOS**: `react-native-health` (Apple HealthKit)
  - **Android**: `react-native-health-connect` (Google Health Connect)

## 📦 Cài đặt & Chạy dự án

1. **Clone dự án về máy:**
   ```bash
   git clone <repository-url>
   cd HealthTracker
   ```

2. **Cài đặt các thư viện (dependencies):**
   ```bash
   npm install
   # hoặc nếu bạn dùng yarn
   yarn install
   ```

3. **Khởi động ứng dụng:**
   ```bash
   npx expo start
   ```

Trong cửa sổ terminal, bạn có thể nhấn:
- `a` để mở ứng dụng trên Android Emulator.
- `i` để mở ứng dụng trên iOS Simulator.

## 🛠️ Cấu trúc thư mục

Dự án sử dụng kiến trúc **File-based routing** của Expo Router. Mã nguồn chính của dự án được đặt trong thư mục `src` và các cấu hình liên quan đến điều hướng nằm trong cấu trúc router của Expo.

## 📜 Các lệnh cơ bản (Scripts)

- `npm start`: Khởi động Metro bundler.
- `npm run android`: Chạy ứng dụng trên thiết bị / máy ảo Android.
- `npm run ios`: Chạy ứng dụng trên thiết bị / máy ảo iOS.
- `npm run lint`: Chạy ESLint để kiểm tra và định dạng lại mã nguồn.
- `npm run web`: Chạy ứng dụng trên trình duyệt (phiên bản web tĩnh).

## 🤝 Đóng góp (Contributing)

Nếu bạn muốn đóng góp cho dự án, vui lòng tạo **Pull Request** hoặc mở **Issue** để thảo luận về những thay đổi bạn muốn thực hiện.
