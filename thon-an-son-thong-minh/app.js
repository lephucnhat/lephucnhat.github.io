/* ==========================================================================
   THÔN AN SƠN THÔNG MINH - LOGIC ỨNG DỤNG V3.0 (HOÀN THIỆN THỰC TẾ)
   - Dữ liệu chính xác 7 Cán bộ, Đoàn thể Thôn An Sơn
   - PWA Offline-First (Service Worker + Manifest)
   - Lịch Âm Dương Việt Nam (Thuật toán thiên văn TS. Hồ Ngọc Đức)
   - Loa Truyền Thanh Số, Cẩm nang Thủ tục Hành chính, Chợ Quê OCOP
   - Phản ánh hiện trường kèm ảnh nén & Quản trị đầy đủ (Thêm/Xóa/Sao lưu/Khôi phục)
   ========================================================================== */

const SUPER_ADMIN_PHONE = '0399985230'; // Ông Nguyễn Anh Hào - Bí thư Chi đoàn (Tổng Quản Trị)
const DEFAULT_SUPER_PIN_HASH = 'cbf4c2c98f95674affa1a3e24be0eb4e77f29f98541d63164b4146a9fa7e821d';

const STORAGE_KEYS = {
  NOTICES: 'anson_smart_notices_v4',
  NEWS: 'anson_smart_news_v4',
  EVENTS: 'anson_smart_events_v4',
  FEEDBACKS: 'anson_smart_feedbacks_v4',
  SUBSCRIBERS: 'anson_smart_subscribers_v4',
  FONT_SCALE: 'anson_smart_font_scale_v4',
  ADMIN_SESSION: 'anson_smart_admin_session_v4',
  SUPER_PIN_HASH: 'anson_smart_super_pin_hash_v5',
  GRANTED_ADMINS: 'anson_smart_granted_admins_v4'
};

const DEFAULT_NOTICES = [
  {
    id: 'n1',
    title: 'Lịch tiêm phòng dại cho đàn chó, mèo đợt 2 năm 2026',
    level: 'important',
    categoryLabel: '⚠️ Quan trọng',
    date: '22/11/2026',
    author: 'Ban Thú y & Ban Thôn',
    body: 'Kính mời bà con các đội đưa vật nuôi (chó, mèo) đến điểm tiêm tập trung tại sân Nhà văn hóa Thôn An Sơn từ 07h30 đến 11h00 sáng thứ Ba (24/11/2026). Bà con nhớ mang theo sổ theo dõi hoặc rọ mõm để đảm bảo an toàn.'
  },
  {
    id: 'n2',
    title: 'Thông báo lịch tạm ngừng cấp điện bảo trì đường dây khu vực Đội 1 - Đội 2',
    level: 'urgent',
    categoryLabel: '🚨 Khẩn cấp',
    date: '21/11/2026',
    author: 'Điện lực Cam Lộ',
    body: 'Điện lực thông báo tạm ngừng cấp điện từ 07h00 đến 11h30 ngày 25/11/2026 tại khu vực Đội 1 và Đội 2 Thôn An Sơn để phát quang hành lang lưới điện và thay sứ cách điện. Mong bà con chủ động sắp xếp sinh hoạt.'
  },
  {
    id: 'n3',
    title: 'Ra quân Ngày Chủ Nhật Xanh - Tổng vệ sinh đường làng ngõ xóm',
    level: 'normal',
    categoryLabel: '📢 Sinh hoạt chung',
    date: '20/11/2026',
    author: 'Chi đoàn Thanh niên Thôn An Sơn',
    body: 'Kính mời toàn thể đoàn viên thanh niên và bà con nhân dân tham gia phát quang bụi rậm, khơi thông cống rãnh tuyến đường liên thôn vào lúc 06h30 sáng Chủ Nhật tuần này. Dụng cụ: chổi, cuốc, bao đựng rác.'
  },
  {
    id: 'n4',
    title: 'Hướng dẫn bà con cài đặt và tích hợp Giấy tờ xe, BHYT lên ứng dụng VNeID',
    level: 'normal',
    categoryLabel: '📢 Sinh hoạt chung',
    date: '18/11/2026',
    author: 'Tổ Công nghệ số cộng đồng',
    body: 'Tổ Công nghệ số cộng đồng Thôn An Sơn trực hỗ trợ bà con cài đặt VNeID mức độ 2 và tích hợp BHYT, GPLX vào các buổi tối thứ 4 và thứ 6 hàng tuần tại Nhà văn hóa thôn.'
  }
];

const DEFAULT_NEWS = [
  {
    id: 'news1',
    tag: 'Chuyển đổi số',
    date: '22/11/2026',
    title: 'Thôn An Sơn đưa vào vận hành Cổng thông tin Thôn Thông Minh phục vụ bà con',
    summary: 'Chỉ cần quét mã QR bằng Zalo hoặc mở trên điện thoại, bà con dễ dàng xem thông báo, lịch âm dương, lịch họp, gọi điện cho 7 cán bộ thôn và gửi phản ánh kiến nghị mọi lúc mọi nơi.'
  },
  {
    id: 'news2',
    tag: 'Nông thôn mới',
    date: '19/11/2026',
    title: 'Hoàn thành lắp đặt thêm 12 bóng đèn năng lượng mặt trời tại tuyến đường Đội 3',
    summary: 'Từ nguồn xã hội hóa và sự đóng góp của bà con, tuyến đường vào Đội 3 đã sáng đẹp, đảm bảo an toàn giao thông và an ninh trật tự vào ban đêm.'
  },
  {
    id: 'news3',
    tag: 'Gương sáng',
    date: '15/11/2026',
    title: 'Chi đoàn Thôn An Sơn hỗ trợ ngày công sửa chữa mái nhà cho hộ gia đình chính sách',
    summary: 'Hơn 15 đoàn viên thanh niên đã tham gia lợp lại mái tôn, gia cố cửa sổ giúp gia đình bác Lê Văn M. ổn định chỗ ở trước mùa mưa bão.'
  }
];

const DEFAULT_EVENTS = [
  {
    id: 'ev1',
    day: '24',
    month: 'Th11',
    time: '07:30 - 11:00',
    title: 'Tiêm phòng dại cho chó, mèo toàn thôn',
    location: 'Sân Nhà văn hóa Thôn An Sơn',
    audience: 'Các hộ gia đình nuôi chó, mèo'
  },
  {
    id: 'ev2',
    day: '25',
    month: 'Th11',
    time: '19:30 - 21:00',
    title: 'Họp triển khai kế hoạch sản xuất vụ Đông Xuân',
    location: 'Hội trường Nhà văn hóa Thôn An Sơn',
    audience: 'Đại diện các hộ dân & Tổ trưởng các đội'
  },
  {
    id: 'ev3',
    day: '27',
    month: 'Th11',
    time: '19:00 - 20:30',
    title: 'Tổ Công nghệ số hướng dẫn VNeID & Dịch vụ công',
    location: 'Nhà văn hóa Thôn An Sơn',
    audience: 'Bà con có nhu cầu hỗ trợ điện thoại'
  },
  {
    id: 'ev4',
    day: '29',
    month: 'Th11',
    time: '06:30 - 08:30',
    title: 'Ngày Chủ Nhật Xanh - Dọn vệ sinh đường thôn',
    location: 'Các tuyến đường trục chính & xóm',
    audience: 'Toàn thể bà con & Đoàn thanh niên'
  }
];

// DANH SÁCH CHÍNH THỨC CÁN BỘ, ĐOÀN THỂ THÔN AN SƠN (XÃ CAM LỘ, QUẢNG TRỊ)
const OFFICIALS_DATA = [
  {
    stt: 1,
    name: 'Ông Nguyễn Văn Thon',
    role: 'Bí thư Chi bộ',
    unit: 'Chi bộ',
    duty: 'Lãnh đạo toàn diện công tác Đảng và phong trào xây dựng Thôn An Sơn kiểu mẫu',
    phone: '0905487333',
    phoneDisplay: '0905 487 333',
    badge: 'Chi bộ'
  },
  {
    stt: 2,
    name: 'Ông Nguyễn Trưng Vương',
    role: 'Phó Bí thư Chi bộ, Trưởng thôn',
    unit: 'Thôn',
    duty: 'Điều hành công việc chung của thôn, xác nhận dân cư, giải quyết kiến nghị bà con',
    phone: '0915713393',
    phoneDisplay: '0915 713 393',
    badge: 'Trưởng thôn'
  },
  {
    stt: 3,
    name: 'Bà Mai Thị Vân Anh',
    role: 'Trưởng ban Công tác Mặt trận',
    unit: 'Mặt trận',
    duty: 'Vận động đoàn kết toàn dân, công tác an sinh xã hội, hỗ trợ hộ khó khăn',
    phone: '0372850580',
    phoneDisplay: '0372 850 580',
    badge: 'Mặt trận'
  },
  {
    stt: 4,
    name: 'Ông Lê Văn Diện',
    role: 'Chi hội trưởng Nông dân',
    unit: 'Nông dân',
    duty: 'Hỗ trợ kỹ thuật trồng trọt, chăn nuôi, giống cây trồng và vốn vay nông nghiệp',
    phone: '0397074718',
    phoneDisplay: '0397 074 718',
    badge: 'Nông dân'
  },
  {
    stt: 5,
    name: 'Bà Võ Thị Thanh Nga',
    role: 'Chi hội trưởng Phụ nữ',
    unit: 'Phụ nữ',
    duty: 'Phong trào 5 không 3 sạch, vệ sinh môi trường, tín dụng tiết kiệm hội viên',
    phone: '0365064791',
    phoneDisplay: '0365 064 791',
    badge: 'Phụ nữ'
  },
  {
    stt: 6,
    name: 'Ông Nguyễn Anh Hào',
    role: 'Bí thư Chi đoàn',
    unit: 'Đoàn',
    duty: 'Công tác thanh niên, Tổ Công nghệ số cộng đồng, Tổng Quản Trị cổng thông tin thôn',
    phone: '0399985230',
    phoneDisplay: '0399 985 230',
    badge: 'Đoàn thanh niên'
  },
  {
    stt: 7,
    name: 'Ông Nguyễn Hữu Thọ',
    role: 'Tổ trưởng Tổ bảo vệ an ninh, trật tự',
    unit: 'ANTT',
    duty: 'Giữ gìn an ninh trật tự thôn xóm, tuần tra đêm, tiếp nhận tin báo an ninh',
    phone: '0358390113',
    phoneDisplay: '0358 390 113',
    badge: 'An ninh trật tự'
  }
];

const DEFAULT_FEEDBACKS = [
  {
    id: 'fb1',
    unit: 'Thôn',
    topic: 'Đèn đường / Điện lưới',
    location: 'Ngã ba đầu xóm Đội 2',
    content: 'Bóng đèn đường số 08 bị chập chờn 2 hôm nay, mong ban thôn cho kiểm tra thay mới để bà con đi lại buổi tối an toàn.',
    author: 'Anh Tuấn (Đội 2)',
    date: '21/11/2026',
    status: 'done',
    photo: '',
    reply: 'Ban thôn đã cử tổ điện kiểm tra và thay bóng LED mới vào chiều 21/11. Cảm ơn bà con đã báo tin!'
  },
  {
    id: 'fb2',
    unit: 'Đoàn',
    topic: 'Đường giao thông / Mương thoát nước',
    location: 'Đoạn mương gần cầu nhỏ Đội 4',
    content: 'Sau trận mưa vừa rồi có ít rác và bèo tấp vào miệng cống thoát nước, cần khơi thông trước đợt mưa tới.',
    author: 'Cô Bảy (Đội 4)',
    date: '22/11/2026',
    status: 'processing',
    photo: '',
    reply: 'Chi đoàn đã tiếp nhận! Đội thanh niên xung kích sẽ xử lý trong sáng mai 23/11.'
  }
];

const MARKET_DATA = [
  {
    id: 'm1',
    icon: '🌿',
    category: 'OCOP',
    tag: 'OCOP Cam Lộ',
    name: 'Cao Chè Vằng An Sơn nguyên chất',
    price: '120.000đ / hộp 500g',
    seller: 'Hộ cô Mai (Đội 1)',
    phone: '0912345611',
    desc: 'Nấu từ lá chè vằng sẻ vùng đồi Cam Lộ, giúp mát gan, lợi sữa, ngủ ngon.'
  },
  {
    id: 'm2',
    icon: '🌶️',
    category: 'OCOP',
    tag: 'Đặc sản địa phương',
    name: 'Hồ Tiêu đen phơi nắng tự nhiên',
    price: '165.000đ / kg',
    seller: 'Vườn chú Tư (Đội 2)',
    phone: '0912345612',
    desc: 'Hạt chắc, cay thơm nồng, thu hái thủ công không chất bảo quản.'
  },
  {
    id: 'm3',
    icon: '🍯',
    category: 'OCOP',
    tag: 'OCOP Quảng Trị',
    name: 'Mật ong hoa rừng Cam Lộ',
    price: '250.000đ / chai 750ml',
    seller: 'Anh Bình (Đội 3)',
    phone: '0912345613',
    desc: 'Mật ong nguyên chất khai thác theo mùa, đặc sánh, thơm dịu.'
  },
  {
    id: 'm4',
    icon: '🐔',
    category: 'Tươi sống',
    tag: 'Thực phẩm tươi',
    name: 'Gà đồi thả vườn An Sơn',
    price: '135.000đ / kg',
    seller: 'Trang trại chị Hạnh (Đội 4)',
    phone: '0912345614',
    desc: 'Gà nuôi thả tự nhiên ăn ngô lúa, thịt săn chắc, nhận làm sạch giao tận nhà.'
  },
  {
    id: 'm5',
    icon: '🥬',
    category: 'Tươi sống',
    tag: 'Rau an toàn',
    name: 'Rau xanh theo mùa (Cải, Mồng tơi, Đậu)',
    price: '15.000đ - 25.000đ / kg',
    seller: 'Tổ hợp tác Rau Đội 3',
    phone: '0912345615',
    desc: 'Cắt sáng sớm mỗi ngày, tưới nước giếng sạch, không thuốc kích thích.'
  },
  {
    id: 'm6',
    icon: '🍄',
    category: 'Tươi sống',
    tag: 'Nấm sạch',
    name: 'Nấm bào ngư xám tươi',
    price: '55.000đ / kg',
    seller: 'Trại nấm anh Dũng (Đội 2)',
    phone: '0912345616',
    desc: 'Thu hái mỗi ngày, giòn ngọt tự nhiên, phù hợp xào hoặc nấu canh.'
  }
];

const PROCEDURES_DATA = [
  {
    id: 'p1',
    title: 'Đăng ký Khai sinh cho trẻ',
    docs: 'CCCD của cha/mẹ, Giấy chứng sinh bản chính, Giấy đăng ký kết hôn (nếu có).',
    place: 'UBND Xã Cam Lộ hoặc nộp online trên Cổng Dịch vụ công.',
    time: 'Giải quyết trong ngày làm việc.'
  },
  {
    id: 'p2',
    title: 'Chứng thực chữ ký / Bản sao y',
    docs: 'Bản chính giấy tờ cần sao y + CCCD bản chính (hoặc VNeID mức 2).',
    place: 'Bộ phận Một cửa UBND Xã Cam Lộ.',
    time: 'Nhận kết quả ngay trong buổi.'
  },
  {
    id: 'p3',
    title: 'Đăng ký Thường trú / Tạm trú',
    docs: 'CCCD, Giấy tờ chứng minh chỗ ở hợp pháp (Sổ đỏ hoặc xác nhận chủ hộ).',
    place: 'Nộp trực tuyến qua ứng dụng VNeID hoặc Công an Xã Cam Lộ.',
    time: '3 - 7 ngày làm việc.'
  },
  {
    id: 'p4',
    title: 'Xác nhận tình trạng hôn nhân / Giấy tờ thôn',
    docs: 'CCCD, đơn đề nghị xác nhận theo mẫu (liên hệ Trưởng thôn Nguyễn Trưng Vương).',
    place: 'Nhà văn hóa Thôn An Sơn & UBND Xã Cam Lộ.',
    time: '1 - 3 ngày làm việc.'
  }
];

let currentNoticeFilter = 'all';
let currentFeedbackUnitFilter = 'all';
let currentMarketFilter = 'all';
let currentSpeakingId = null;
let pendingFeedbackPhoto = '';
let deferredInstallPrompt = null;
let fontScaleIndex = 0;
const FONT_MODES = [
  { cls: '', label: 'Cỡ chữ: Vừa' },
  { cls: 'font-large', label: 'Cỡ chữ: To' },
  { cls: 'font-xlarge', label: 'Cỡ chữ: Rất to' }
];

// ==========================================================================
// KHỞI TẠO ỨNG DỤNG & SERVICE WORKER
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  registerServiceWorker();
  setupNetworkListeners();
  setupPWAInstallPrompt();
  initDateAndLunarDisplay();
  initFontScale();
  initStorageDefaults();
  renderAll();
  generateQRCodes();
  updateAdminUI();
});

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

function setupNetworkListeners() {
  const banner = document.getElementById('offline-banner');
  const syncStatus = () => {
    if (banner) banner.classList.toggle('hidden', navigator.onLine);
  };
  window.addEventListener('online', () => {
    syncStatus();
    showToast('Đã kết nối lại Internet!', '🌐');
  });
  window.addEventListener('offline', syncStatus);
  syncStatus();
}

function setupPWAInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const btn = document.getElementById('btn-install-pwa');
    if (btn) btn.classList.remove('hidden');
  });
}

async function installPWA() {
  if (!deferredInstallPrompt) {
    navigateTo('utilities');
    showToast('Xem hướng dẫn cài đặt ở mục Tiện ích!', '📲');
    return;
  }
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  document.getElementById('btn-install-pwa')?.classList.add('hidden');
}

// ==========================================================================
// THUẬT TOÁN ÂM LỊCH VIỆT NAM (TS. HỒ NGỌC ĐỨC)
// ==========================================================================
const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

function jdFromDate(dd, mm, yy) {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }
  return jd;
}

function getNewMoonDay(k, timeZone) {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 -= 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 += 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 -= 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 -= 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 += 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  const deltat = (T < -11)
    ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
    : -0.000278 + 0.000265 * T + 0.000262 * T2;
  return Math.floor(Jd1 + C1 - deltat + 0.5 + timeZone / 24);
}

function getSunLongitude(jdn, timeZone) {
  const T = (jdn - 2451545.5 - timeZone / 24) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;
  const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
  let L = (L0 + DL) * dr;
  L = L - Math.PI * 2 * Math.floor(L / (Math.PI * 2));
  return Math.floor((L / Math.PI) * 6);
}

function getLunarMonth11(yy, timeZone) {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  if (getSunLongitude(nm, timeZone) >= 9) nm = getNewMoonDay(k - 1, timeZone);
  return nm;
}

function getLeapMonthOffset(a11, timeZone) {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0, i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

function convertSolar2Lunar(dd, mm, yy, timeZone = 7) {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) monthStart = getNewMoonDay(k, timeZone);
  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let lunarLeap = 0;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) lunarLeap = 1;
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
  return { day: lunarDay, month: lunarMonth, year: lunarYear, leap: lunarLeap };
}

function initDateAndLunarDisplay() {
  const now = new Date();
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[now.getDay()];
  const dd = now.getDate();
  const mm = now.getMonth() + 1;
  const yyyy = now.getFullYear();

  const dateEl = document.getElementById('current-date-text');
  if (dateEl) {
    dateEl.textContent = `${dayName}, ${String(dd).padStart(2, '0')}/${String(mm).padStart(2, '0')}/${yyyy}`;
  }

  const lunar = convertSolar2Lunar(dd, mm, yyyy, 7);
  const canChiYear = `${CAN[(lunar.year + 6) % 10]} ${CHI[(lunar.year + 8) % 12]}`;
  const lunarEl = document.getElementById('current-lunar-text');
  if (lunarEl) {
    lunarEl.textContent = `Âm lịch: ${lunar.day}/${lunar.month}${lunar.leap ? ' (Nhuận)' : ''} • Năm ${canChiYear}`;
  }
}

// ==========================================================================
// DỮ LIỆU LOCAL STORAGE
// ==========================================================================
function initStorageDefaults() {
  if (!localStorage.getItem(STORAGE_KEYS.NOTICES)) {
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(DEFAULT_NOTICES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NEWS)) {
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(DEFAULT_NEWS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FEEDBACKS)) {
    localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(DEFAULT_FEEDBACKS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS)) {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify([]));
  }
}

function getNotices() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTICES)) || DEFAULT_NOTICES; } catch { return DEFAULT_NOTICES; }
}
function getNews() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.NEWS)) || DEFAULT_NEWS; } catch { return DEFAULT_NEWS; }
}
function getEvents() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS)) || DEFAULT_EVENTS; } catch { return DEFAULT_EVENTS; }
}
function getFeedbacks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.FEEDBACKS)) || DEFAULT_FEEDBACKS; } catch { return DEFAULT_FEEDBACKS; }
}
function getSubscribers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS)) || []; } catch { return []; }
}
function getAdminSession() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION)); } catch { return null; }
}
function isAdmin() {
  return !!getAdminSession();
}
function isSuperAdmin() {
  const s = getAdminSession();
  return !!(s && s.phone === SUPER_ADMIN_PHONE);
}
function getSuperPinHash() {
  return localStorage.getItem(STORAGE_KEYS.SUPER_PIN_HASH) || DEFAULT_SUPER_PIN_HASH;
}
async function sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function getGrantedAdmins() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.GRANTED_ADMINS)) || {}; } catch { return {}; }
}

// ==========================================================================
// ĐIỀU HƯỚNG & MENU DI ĐỘNG
// ==========================================================================
function navigateTo(viewName) {
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-nav') === viewName);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openMobileMenu() {
  document.getElementById('modal-mobile-menu')?.classList.remove('hidden');
}

// ==========================================================================
// CỠ CHỮ CHO NGƯỜI LỚN TUỔI
// ==========================================================================
function initFontScale() {
  const saved = parseInt(localStorage.getItem(STORAGE_KEYS.FONT_SCALE) || '0', 10);
  fontScaleIndex = isNaN(saved) ? 0 : saved % FONT_MODES.length;
  applyFontScale();
}

function cycleFontSize() {
  fontScaleIndex = (fontScaleIndex + 1) % FONT_MODES.length;
  localStorage.setItem(STORAGE_KEYS.FONT_SCALE, String(fontScaleIndex));
  applyFontScale();
  showToast(`Đã đổi sang ${FONT_MODES[fontScaleIndex].label}`, '🔎');
}

function applyFontScale() {
  const html = document.documentElement;
  html.classList.remove('font-large', 'font-xlarge');
  const mode = FONT_MODES[fontScaleIndex];
  if (mode.cls) html.classList.add(mode.cls);
  const labelEl = document.getElementById('font-label');
  if (labelEl) labelEl.textContent = mode.label;
}

// ==========================================================================
// NGHE ĐỌC TIẾNG VIỆT
// ==========================================================================
function speakById(type, id, btnElement) {
  let text = '';
  if (type === 'notice') {
    const item = getNotices().find(n => n.id === id);
    if (item) text = `${item.title}. ${item.body}`;
  } else if (type === 'news') {
    const item = getNews().find(n => n.id === id);
    if (item) text = `${item.title}. ${item.summary}`;
  } else if (type === 'proc') {
    const item = PROCEDURES_DATA.find(p => p.id === id);
    if (item) text = `${item.title}. Hồ sơ cần chuẩn bị: ${item.docs}. Nơi nộp: ${item.place}. Thời gian: ${item.time}`;
  }
  if (!text) return;
  runSpeech(`${type}-${id}`, text, btnElement, '🔊 Nghe đọc');
}

function speakDailyBulletin(btnElement) {
  const notices = getNotices().slice(0, 3);
  if (notices.length === 0) {
    showToast('Hiện chưa có thông báo mới để đọc.', '📻');
    return;
  }
  const intro = 'Bản tin truyền thanh số Thôn An Sơn, xã Cam Lộ. ';
  const body = notices.map((n, idx) => `Tin thứ ${idx + 1}: ${n.title}. ${n.body}`).join(' ');
  runSpeech('daily-bulletin', intro + body, btnElement, '🔊 Nghe bản tin hôm nay');
}

function runSpeech(key, text, btnElement, defaultLabel) {
  if (!('speechSynthesis' in window)) {
    showToast('Trình duyệt này chưa hỗ trợ đọc giọng nói.', '⚠️');
    return;
  }
  if (currentSpeakingId === key && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    resetSpeakButtons();
    return;
  }

  window.speechSynthesis.cancel();
  resetSpeakButtons();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'vi-VN';
  utterance.rate = 0.95;

  currentSpeakingId = key;
  if (btnElement) {
    btnElement.dataset.defaultLabel = defaultLabel;
    btnElement.classList.add('speaking-active');
    btnElement.textContent = '⏹️ Dừng đọc';
  }

  utterance.onend = () => resetSpeakButtons();
  utterance.onerror = () => resetSpeakButtons();
  window.speechSynthesis.speak(utterance);
}

function resetSpeakButtons() {
  currentSpeakingId = null;
  document.querySelectorAll('.btn-speak').forEach(btn => {
    btn.classList.remove('speaking-active');
    btn.textContent = btn.dataset.defaultLabel || '🔊 Nghe đọc';
  });
}

// ==========================================================================
// RENDER TẤT CẢ CÁC PHÂN HỆ
// ==========================================================================
function renderAll() {
  renderHome();
  renderNoticesPage();
  renderNewsPage();
  renderCalendarPage();
  renderOfficialsPage();
  renderFeedbackPage();
  renderMarketPage();
  renderProceduresList();
}

function getLevelBadgeClass(level) {
  if (level === 'urgent') return 'badge-urgent';
  if (level === 'important') return 'badge-important';
  return 'badge-normal';
}

function renderHome() {
  const notices = getNotices();
  const badge = document.getElementById('home-notice-badge');
  if (badge) {
    badge.textContent = notices.length;
    badge.classList.toggle('hidden', notices.length === 0);
  }

  const latestBox = document.getElementById('home-latest-notices');
  if (latestBox) {
    latestBox.innerHTML = notices.slice(0, 2).map(n => `
      <article class="civic-card civic-card-hover p-4 sm:p-5 flex flex-col justify-between gap-3">
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="badge ${getLevelBadgeClass(n.level)}">${escapeHtml(n.categoryLabel)}</span>
            <span class="text-xs text-slate-500 font-medium">${escapeHtml(n.date)}</span>
          </div>
          <h4 class="font-bold text-slate-900 text-base leading-snug">${escapeHtml(n.title)}</h4>
          <p class="text-sm text-slate-600 line-clamp-3">${escapeHtml(n.body)}</p>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-slate-100">
          <span class="text-xs text-slate-500 font-medium">✍️ ${escapeHtml(n.author)}</span>
          <button onclick="speakById('notice', '${escapeHtml(n.id)}', this)"
            class="btn-speak text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition cursor-pointer">
            🔊 Nghe đọc
          </button>
        </div>
      </article>
    `).join('');
  }

  const evBox = document.getElementById('home-upcoming-events');
  if (evBox) {
    evBox.innerHTML = getEvents().slice(0, 3).map(ev => `
      <div class="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
        <div class="w-12 h-12 rounded-xl bg-emerald-600 text-white flex flex-col items-center justify-center shrink-0 leading-tight">
          <span class="text-base font-extrabold">${escapeHtml(ev.day)}</span>
          <span class="text-[10px] uppercase font-semibold opacity-90">${escapeHtml(ev.month)}</span>
        </div>
        <div class="min-w-0">
          <div class="text-sm font-bold text-slate-900 truncate">${escapeHtml(ev.title)}</div>
          <div class="text-xs text-slate-500 truncate">⏰ ${escapeHtml(ev.time)} • 📍 ${escapeHtml(ev.location)}</div>
        </div>
      </div>
    `).join('');
  }

  // 3 Lãnh đạo chủ chốt đầu tiên trên Trang chủ
  const contactBox = document.getElementById('home-quick-contacts');
  if (contactBox) {
    contactBox.innerHTML = OFFICIALS_DATA.slice(0, 3).map(of => `
      <div class="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
        <div class="min-w-0">
          <div class="text-xs font-bold text-emerald-700 uppercase truncate">${escapeHtml(of.role)}</div>
          <div class="text-sm font-bold text-slate-900 truncate">${escapeHtml(of.name)} • <span class="font-mono text-xs text-slate-600">${of.phoneDisplay}</span></div>
        </div>
        <a href="tel:${of.phone}"
          class="shrink-0 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition">
          📞 Gọi
        </a>
      </div>
    `).join('');
  }
}

function setNoticeFilter(cat, btn) {
  currentNoticeFilter = cat;
  document.querySelectorAll('.notice-filter-btn').forEach(b => {
    b.className = 'notice-filter-btn px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-white border border-slate-300 text-slate-700 cursor-pointer shrink-0';
  });
  btn.className = 'notice-filter-btn px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-emerald-600 text-white cursor-pointer shrink-0';
  renderNoticesPage();
}

function renderNoticesPage() {
  const notices = getNotices();
  const query = (document.getElementById('notice-search')?.value || '').trim().toLowerCase();
  const adminMode = isAdmin();

  const filtered = notices.filter(n => {
    const matchCat = currentNoticeFilter === 'all' || n.level === currentNoticeFilter;
    const matchText = !query || n.title.toLowerCase().includes(query) || n.body.toLowerCase().includes(query);
    return matchCat && matchText;
  });

  const listEl = document.getElementById('notices-list');
  if (!listEl) return;

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="civic-card p-8 text-center text-slate-500 text-sm">Không tìm thấy thông báo phù hợp.</div>`;
    return;
  }

  listEl.innerHTML = filtered.map(n => `
    <article class="civic-card p-5 space-y-2.5">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="badge ${getLevelBadgeClass(n.level)}">${escapeHtml(n.categoryLabel)}</span>
        <span class="text-xs text-slate-500 font-medium">📅 ${escapeHtml(n.date)} • ✍️ ${escapeHtml(n.author)}</span>
      </div>
      <h3 class="text-base sm:text-lg font-extrabold text-slate-900">${escapeHtml(n.title)}</h3>
      <p class="text-sm sm:text-base text-slate-700 leading-relaxed">${escapeHtml(n.body)}</p>
      <div class="pt-2 flex items-center justify-end gap-2">
        ${adminMode ? `
          <button onclick="adminDeleteItem('notice', '${escapeHtml(n.id)}')"
            class="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition cursor-pointer">
            🗑️ Xóa
          </button>
        ` : ''}
        <button onclick="speakById('notice', '${escapeHtml(n.id)}', this)"
          class="btn-speak text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition cursor-pointer">
          🔊 Nghe đọc
        </button>
      </div>
    </article>
  `).join('');
}

function renderNewsPage() {
  const el = document.getElementById('news-list');
  if (!el) return;
  const adminMode = isAdmin();
  el.innerHTML = getNews().map(item => `
    <article class="civic-card civic-card-hover p-5 space-y-2.5 flex flex-col justify-between">
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="badge badge-info">${escapeHtml(item.tag)}</span>
          <span class="text-slate-500">${escapeHtml(item.date)}</span>
        </div>
        <h3 class="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">${escapeHtml(item.title)}</h3>
        <p class="text-sm text-slate-600 leading-relaxed">${escapeHtml(item.summary)}</p>
      </div>
      <div class="pt-2 flex items-center justify-between gap-2">
        <button onclick="speakById('news', '${escapeHtml(item.id)}', this)"
          class="btn-speak text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition cursor-pointer">
          🔊 Nghe đọc
        </button>
        ${adminMode ? `
          <button onclick="adminDeleteItem('news', '${escapeHtml(item.id)}')"
            class="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg cursor-pointer">
            🗑️ Xóa
          </button>
        ` : ''}
      </div>
    </article>
  `).join('');
}

function renderCalendarPage() {
  const el = document.getElementById('calendar-list');
  if (!el) return;
  const adminMode = isAdmin();
  el.innerHTML = getEvents().map(ev => `
    <div class="civic-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-start sm:items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
          <span class="text-xl font-extrabold leading-none">${escapeHtml(ev.day)}</span>
          <span class="text-[11px] font-semibold uppercase mt-0.5">${escapeHtml(ev.month)}</span>
        </div>
        <div class="space-y-1">
          <h3 class="text-base font-extrabold text-slate-900">${escapeHtml(ev.title)}</h3>
          <div class="text-xs sm:text-sm text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
            <span>⏰ <strong>${escapeHtml(ev.time)}</strong></span>
            <span>📍 ${escapeHtml(ev.location)}</span>
          </div>
          <div class="text-xs text-emerald-700 font-semibold">👥 ${escapeHtml(ev.audience || 'Toàn thể bà con')}</div>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button onclick="saveEventReminder('${escapeHtml(ev.id)}')"
          class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-bold transition cursor-pointer">
          🔔 Nhắc tôi
        </button>
        ${adminMode ? `
          <button onclick="adminDeleteItem('event', '${escapeHtml(ev.id)}')"
            class="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold cursor-pointer">
            🗑️
          </button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

function saveEventReminder(evId) {
  const ev = getEvents().find(e => e.id === evId);
  if (!ev) return;
  const key = 'anson_reminders_v3';
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem(key) || '[]'); } catch { saved = []; }
  if (!saved.includes(evId)) saved.push(evId);
  localStorage.setItem(key, JSON.stringify(saved));
  renderCalendarPage();
  showToast(`Đã đặt nhắc lịch: ${ev.title} (${ev.day} ${ev.month})`, '📅');
}

function renderOfficialsPage() {
  const el = document.getElementById('officials-list');
  if (!el) return;
  const query = (document.getElementById('official-search')?.value || '').trim().toLowerCase();

  const list = OFFICIALS_DATA.filter(of => {
    if (!query) return true;
    return of.name.toLowerCase().includes(query) || of.role.toLowerCase().includes(query) || of.duty.toLowerCase().includes(query);
  });

  if (list.length === 0) {
    el.innerHTML = `<div class="col-span-full civic-card p-8 text-center text-slate-500 text-sm">Không tìm thấy cán bộ phù hợp.</div>`;
    return;
  }

  el.innerHTML = list.map(of => `
    <div class="civic-card civic-card-hover p-5 flex flex-col justify-between gap-4">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between gap-2">
          <span class="badge badge-normal">${of.stt}. ${escapeHtml(of.badge)}</span>
          <button onclick="copyPhone('${of.phone}', '${escapeHtml(of.phoneDisplay)}')" title="Sao chép số điện thoại"
            class="text-xs font-mono font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg cursor-pointer transition">
            📋 ${of.phoneDisplay}
          </button>
        </div>
        <h3 class="text-base sm:text-lg font-extrabold text-slate-900 pt-1">${escapeHtml(of.name)}</h3>
        <div class="text-xs font-bold text-emerald-700 uppercase">${escapeHtml(of.role)}</div>
        <p class="text-xs sm:text-sm text-slate-600 pt-1">${escapeHtml(of.duty)}</p>
      </div>
      <div class="flex gap-2 pt-2 border-t border-slate-100">
        <a href="tel:${of.phone}"
          class="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-2.5 rounded-xl transition">
          📞 Gọi ngay
        </a>
        <a href="https://zalo.me/${of.phone}" target="_blank" rel="noopener"
          class="inline-flex items-center justify-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-sm px-4 py-2.5 rounded-xl transition">
          💬 Zalo
        </a>
      </div>
    </div>
  `).join('');
}

function copyPhone(phone, display) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(phone).then(() => {
      showToast(`Đã sao chép số: ${display}`, '📋');
    }).catch(() => showToast(`Số điện thoại: ${display}`, '📞'));
  } else {
    showToast(`Số điện thoại: ${display}`, '📞');
  }
}

function setFeedbackUnitFilter(unit, btn) {
  currentFeedbackUnitFilter = unit;
  document.querySelectorAll('.fb-unit-filter').forEach(b => {
    b.className = 'fb-unit-filter px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-slate-300 text-slate-700 cursor-pointer shrink-0';
  });
  btn.className = 'fb-unit-filter px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white cursor-pointer shrink-0';
  renderFeedbackPage();
}

function renderFeedbackPage() {
  const allFeedbacks = getFeedbacks();
  const feedbacks = allFeedbacks.filter(fb => currentFeedbackUnitFilter === 'all' || (fb.unit || 'Thôn') === currentFeedbackUnitFilter);
  const countBadge = document.getElementById('fb-count-badge');
  if (countBadge) countBadge.textContent = `${feedbacks.length} ý kiến`;

  const listEl = document.getElementById('feedback-list');
  if (!listEl) return;

  if (feedbacks.length === 0) {
    listEl.innerHTML = `<div class="civic-card p-6 text-center text-slate-500 text-sm">Chưa có ý kiến nào gửi đến đơn vị này.</div>`;
    return;
  }

  const session = getAdminSession();
  const superMode = isSuperAdmin();

  listEl.innerHTML = feedbacks.map(fb => {
    let statusHtml = `<span class="badge badge-info">📥 Đã tiếp nhận</span>`;
    if (fb.status === 'processing') statusHtml = `<span class="badge badge-important">🔧 Đang xử lý</span>`;
    if (fb.status === 'done') statusHtml = `<span class="badge badge-normal">✅ Đã hoàn thành</span>`;
    const unitLabel = fb.unit || 'Thôn';
    const canManageThis = superMode || (session && (session.unit === unitLabel || session.unit === 'Thôn'));

    return `
      <div class="civic-card p-4 sm:p-5 space-y-2.5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">📌 Gửi: ${escapeHtml(unitLabel)}</span>
            <span class="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">${escapeHtml(fb.topic)}</span>
          </div>
          ${statusHtml}
        </div>
        ${fb.location ? `<div class="text-xs font-semibold text-slate-500">📍 Khu vực: ${escapeHtml(fb.location)}</div>` : ''}
        <p class="text-sm text-slate-800 leading-relaxed">${escapeHtml(fb.content)}</p>
        ${fb.photo ? `<img src="${fb.photo}" alt="Ảnh hiện trường" class="max-h-44 rounded-xl border border-slate-200 object-cover" />` : ''}
        <div class="text-xs text-slate-500 flex items-center justify-between">
          <span>👤 ${escapeHtml(fb.author || 'Bà con ẩn danh')}</span>
          <span>📅 ${escapeHtml(fb.date)}</span>
        </div>
        ${fb.reply ? `
          <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs sm:text-sm text-emerald-900">
            <strong>🛡️ Phản hồi (${escapeHtml(unitLabel)}):</strong> ${escapeHtml(fb.reply)}
          </div>
        ` : ''}
        ${canManageThis ? `
          <div class="pt-2 border-t border-slate-100 flex justify-end gap-2">
            <button onclick="adminDeleteItem('feedback', '${escapeHtml(fb.id)}')" class="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer">
              🗑️ Xóa
            </button>
            <button onclick="openReplyModal('${escapeHtml(fb.id)}')" class="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer">
              ✏️ Trả lời ý kiến
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function setMarketFilter(cat, btn) {
  currentMarketFilter = cat;
  document.querySelectorAll('.market-filter-btn').forEach(b => {
    b.className = 'market-filter-btn px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-white border border-slate-300 text-slate-700 cursor-pointer shrink-0';
  });
  btn.className = 'market-filter-btn px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-emerald-600 text-white cursor-pointer shrink-0';
  renderMarketPage();
}

function renderMarketPage() {
  const el = document.getElementById('market-list');
  if (!el) return;
  const items = MARKET_DATA.filter(m => currentMarketFilter === 'all' || m.category === currentMarketFilter);
  el.innerHTML = items.map(item => `
    <div class="civic-card civic-card-hover p-5 flex flex-col justify-between gap-3">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-3xl">${item.icon}</span>
          <span class="badge badge-important">${escapeHtml(item.tag)}</span>
        </div>
        <h3 class="text-base font-extrabold text-slate-900">${escapeHtml(item.name)}</h3>
        <div class="text-sm font-extrabold text-emerald-700">${escapeHtml(item.price)}</div>
        <p class="text-xs sm:text-sm text-slate-600">${escapeHtml(item.desc)}</p>
        <div class="text-xs font-semibold text-slate-500">🏡 ${escapeHtml(item.seller)}</div>
      </div>
      <div class="flex gap-2 pt-2 border-t border-slate-100">
        <a href="tel:${item.phone}" class="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm py-2.5 rounded-xl transition">
          📞 Gọi đặt mua
        </a>
        <a href="https://zalo.me/${item.phone}" target="_blank" rel="noopener" class="px-3.5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs sm:text-sm rounded-xl transition">
          💬 Zalo
        </a>
      </div>
    </div>
  `).join('');
}

function renderProceduresList() {
  const el = document.getElementById('procedures-list');
  if (!el) return;
  el.innerHTML = PROCEDURES_DATA.map(p => `
    <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
      <div class="space-y-1">
        <h4 class="text-sm sm:text-base font-extrabold text-slate-900">📌 ${escapeHtml(p.title)}</h4>
        <p class="text-xs sm:text-sm text-slate-700"><strong>Giấy tờ:</strong> ${escapeHtml(p.docs)}</p>
        <p class="text-xs text-slate-600"><strong>Nơi làm:</strong> ${escapeHtml(p.place)}</p>
        <p class="text-xs font-semibold text-emerald-700">⏱️ ${escapeHtml(p.time)}</p>
      </div>
      <div class="pt-1">
        <button onclick="speakById('proc', '${p.id}', this)"
          class="btn-speak text-xs font-bold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition cursor-pointer">
          🔊 Nghe đọc
        </button>
      </div>
    </div>
  `).join('');
}

// ==========================================================================
// NÉN ẢNH PHẢN ÁNH HIỆN TRƯỜNG & GỬI FORM
// ==========================================================================
function handleFeedbackPhoto(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxW = 640;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      pendingFeedbackPhoto = canvas.toDataURL('image/jpeg', 0.72);
      const preview = document.getElementById('fb-photo-preview');
      const box = document.getElementById('fb-photo-preview-box');
      if (preview && box) {
        preview.src = pendingFeedbackPhoto;
        box.classList.remove('hidden');
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function clearFeedbackPhoto() {
  pendingFeedbackPhoto = '';
  const input = document.getElementById('fb-photo');
  if (input) input.value = '';
  document.getElementById('fb-photo-preview-box')?.classList.add('hidden');
}

function submitFeedback(e) {
  e.preventDefault();
  const unit = document.getElementById('fb-target-unit').value;
  const topic = document.getElementById('fb-topic').value;
  const location = document.getElementById('fb-location').value.trim();
  const content = document.getElementById('fb-content').value.trim();
  const name = document.getElementById('fb-name').value.trim();
  const phone = document.getElementById('fb-phone').value.trim();
  if (!unit) {
    showToast('Bà con vui lòng chọn đơn vị tiếp nhận ý kiến!', '⚠️');
    return;
  }
  if (!content) return;

  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  const feedbacks = getFeedbacks();
  feedbacks.unshift({
    id: 'fb-' + Date.now(),
    unit,
    topic,
    location,
    content,
    photo: pendingFeedbackPhoto,
    author: name ? (phone ? `${name} (${phone})` : name) : 'Bà con ẩn danh',
    date: dateStr,
    status: 'received',
    reply: ''
  });

  try {
    localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(feedbacks));
  } catch {
    feedbacks[0].photo = '';
    localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(feedbacks));
  }

  document.getElementById('feedback-form').reset();
  clearFeedbackPhoto();
  renderFeedbackPage();
  showToast('Đã gửi phản ánh thành công! Ban thôn sẽ kiểm tra sớm.', '✅');
}

function submitSubscribe(e) {
  e.preventDefault();
  const name = document.getElementById('sub-name').value.trim();
  const phone = document.getElementById('sub-phone').value.trim();
  const group = document.getElementById('sub-group').value;
  if (!name || !phone) return;

  const subs = getSubscribers();
  subs.unshift({ name, phone, group, date: new Date().toLocaleDateString('vi-VN') });
  localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(subs));

  e.target.reset();
  closeModal('modal-subscribe');
  updateAdminUI();
  showToast(`Cảm ơn ${name}! Đã đăng ký nhận thông báo từ Thôn An Sơn.`, '🔔');
}

// ==========================================================================
// PHÂN QUYỀN QUẢN TRỊ: TỔNG QUẢN TRỊ NGUYỄN ANH HÀO & CÁN BỘ CỐT CÁN
// ==========================================================================
function populateAdminSelect() {
  const sel = document.getElementById('admin-user-select');
  if (!sel) return;
  const superOfficer = OFFICIALS_DATA.find(o => o.phone === SUPER_ADMIN_PHONE);
  const others = OFFICIALS_DATA.filter(o => o.phone !== SUPER_ADMIN_PHONE);
  const ordered = superOfficer ? [superOfficer, ...others] : OFFICIALS_DATA;
  sel.innerHTML = ordered.map(o => {
    const prefix = o.phone === SUPER_ADMIN_PHONE ? '👑 [Tổng Quản Trị] ' : '🛡️ ';
    return `<option value="${o.phone}">${prefix}${escapeHtml(o.name)} — ${escapeHtml(o.role)}</option>`;
  }).join('');
}

async function verifyAdminLogin() {
  const phone = document.getElementById('admin-user-select')?.value;
  const pin = document.getElementById('admin-pin-input')?.value.trim();
  if (!phone || !pin) {
    showToast('Vui lòng chọn cán bộ và nhập mã PIN!', '⚠️');
    return;
  }

  const officer = OFFICIALS_DATA.find(o => o.phone === phone);
  if (!officer) return;

  // 1. Tổng quản trị Nguyễn Anh Hào (kiểm tra bằng SHA-256 hash)
  if (phone === SUPER_ADMIN_PHONE) {
    const inputHash = await sha256Hex(pin);
    if (inputHash === getSuperPinHash()) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify({
        phone: officer.phone,
        name: officer.name,
        role: officer.role,
        unit: officer.unit,
        isSuperAdmin: true
      }));
      document.getElementById('admin-pin-input').value = '';
      updateAdminUI();
      renderAll();
      showToast('Xin chào Tổng Quản Trị Nguyễn Anh Hào!', '👑');
    } else {
      showToast('Mã PIN Tổng Quản Trị chưa đúng!', '⚠️');
    }
    return;
  }

  // 2. Cán bộ cốt cán được Nguyễn Anh Hào cấp quyền
  const granted = getGrantedAdmins()[phone];
  if (!granted || !granted.enabled) {
    showToast('Tài khoản chưa được Nguyễn Anh Hào cấp quyền quản trị!', '🔒');
    return;
  }

  if (pin === granted.pin) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify({
      phone: officer.phone,
      name: officer.name,
      role: officer.role,
      unit: officer.unit,
      isSuperAdmin: false
    }));
    document.getElementById('admin-pin-input').value = '';
    updateAdminUI();
    renderAll();
    showToast(`Đăng nhập thành công: ${officer.name}!`, '🛡️');
  } else {
    showToast('Mã PIN chưa đúng! Hãy kiểm tra lại mã PIN được cấp.', '⚠️');
  }
}

function logoutAdmin() {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  updateAdminUI();
  renderAll();
  showToast('Đã đăng xuất khỏi chế độ Quản trị.', '👋');
}

function updateAdminUI() {
  populateAdminSelect();
  const session = getAdminSession();
  const authed = !!session;
  const superMode = isSuperAdmin();

  const loginPanel = document.getElementById('admin-login-panel');
  const dashPanel = document.getElementById('admin-dashboard-panel');
  const grantPanel = document.getElementById('super-admin-grant-panel');
  const sessionBadge = document.getElementById('admin-session-badge');
  const btnHeader = document.getElementById('btn-header-admin');
  const btnIcon = document.getElementById('admin-btn-icon');
  const btnText = document.getElementById('admin-btn-text');

  if (loginPanel && dashPanel) {
    loginPanel.classList.toggle('hidden', authed);
    dashPanel.classList.toggle('hidden', !authed);
  }
  if (grantPanel) {
    grantPanel.classList.toggle('hidden', !superMode);
    if (superMode) renderGrantOfficersList();
  }
  if (sessionBadge && session) {
    sessionBadge.textContent = superMode
      ? `👑 Tổng Quản Trị: ${session.name}`
      : `🛡️ Quản trị (${session.unit}): ${session.name}`;
  }
  if (btnHeader && btnIcon && btnText) {
    if (superMode) {
      btnIcon.textContent = '👑';
      btnText.textContent = 'Admin: Nguyễn Anh Hào';
      btnHeader.className = 'inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-extrabold shadow-sm transition cursor-pointer';
    } else if (authed) {
      btnIcon.textContent = '🛡️';
      btnText.textContent = `Quản trị: ${session.unit}`;
      btnHeader.className = 'inline-flex items-center gap-1.5 bg-emerald-900/60 hover:bg-emerald-900/80 text-white border border-emerald-300/50 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer';
    } else {
      btnIcon.textContent = '🛡️';
      btnText.textContent = 'Quản trị';
      btnHeader.className = 'inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 border border-white/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer';
    }
  }

  const subs = getSubscribers();
  const subCount = document.getElementById('adm-sub-count');
  const subList = document.getElementById('adm-sub-list');
  if (subCount) subCount.textContent = subs.length;
  if (subList) {
    subList.innerHTML = subs.length === 0
      ? '<div class="text-slate-400 italic">Chưa có bà con nào đăng ký mới.</div>'
      : subs.map(s => `<div class="p-2 bg-slate-50 rounded-lg border border-slate-200 flex justify-between"><span><strong>${escapeHtml(s.name)}</strong> (${escapeHtml(s.group)})</span><span class="font-mono">${escapeHtml(s.phone)}</span></div>`).join('');
  }
}

function renderGrantOfficersList() {
  const el = document.getElementById('grant-officers-list');
  if (!el) return;
  const granted = getGrantedAdmins();
  const coreOfficers = OFFICIALS_DATA.filter(o => o.phone !== SUPER_ADMIN_PHONE);

  el.innerHTML = coreOfficers.map(o => {
    const state = granted[o.phone] || { enabled: false, pin: '' };
    return `
      <div class="bg-white border border-amber-200 rounded-xl p-2.5 flex items-center justify-between gap-2">
        <div class="min-w-0">
          <div class="text-xs font-extrabold text-slate-900 truncate">${escapeHtml(o.name)}</div>
          <div class="text-[11px] text-slate-600 truncate">${escapeHtml(o.role)} (${escapeHtml(o.unit)})</div>
          ${state.enabled ? `<div class="text-[11px] font-mono font-bold text-emerald-700 mt-0.5">🔑 Mã PIN cấp: ${escapeHtml(state.pin)}</div>` : ''}
        </div>
        <button onclick="toggleOfficerGrant('${o.phone}')"
          class="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${state.enabled ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-emerald-600 text-white hover:bg-emerald-700'}">
          ${state.enabled ? 'Thu hồi' : 'Cấp quyền'}
        </button>
      </div>
    `;
  }).join('');
}

function toggleOfficerGrant(phone) {
  if (!isSuperAdmin()) {
    showToast('Chỉ Tổng Quản Trị Nguyễn Anh Hào mới có quyền này!', '🔒');
    return;
  }
  const granted = getGrantedAdmins();
  const current = granted[phone];
  if (current && current.enabled) {
    granted[phone] = { ...current, enabled: false };
    showToast('Đã thu hồi quyền quản trị của cán bộ.', '🔒');
  } else {
    const autoPin = current?.pin || String(Math.floor(100000 + Math.random() * 900000));
    granted[phone] = { enabled: true, pin: autoPin };
    showToast(`Đã cấp quyền! Mã PIN đăng nhập: ${autoPin}`, '🔑');
  }
  localStorage.setItem(STORAGE_KEYS.GRANTED_ADMINS, JSON.stringify(granted));
  renderGrantOfficersList();
}

async function changeSuperAdminPin() {
  if (!isSuperAdmin()) return;
  const newPin = document.getElementById('new-super-pin')?.value.trim();
  if (!newPin || newPin.length < 4) {
    showToast('Mã PIN mới phải có ít nhất 4 ký tự!', '⚠️');
    return;
  }
  const hash = await sha256Hex(newPin);
  localStorage.setItem(STORAGE_KEYS.SUPER_PIN_HASH, hash);
  document.getElementById('new-super-pin').value = '';
  showToast('Đã đổi mã PIN Tổng Quản Trị thành công!', '🔐');
}

function adminAddNotice(e) {
  e.preventDefault();
  const title = document.getElementById('adm-notice-title').value.trim();
  const level = document.getElementById('adm-notice-level').value;
  const author = document.getElementById('adm-notice-author').value.trim() || 'Ban cán sự thôn';
  const body = document.getElementById('adm-notice-body').value.trim();
  if (!title || !body) return;

  const catMap = { urgent: '🚨 Khẩn cấp', important: '⚠️ Quan trọng', normal: '📢 Sinh hoạt chung' };
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  const notices = getNotices();
  notices.unshift({
    id: 'n-' + Date.now(),
    title,
    level,
    categoryLabel: catMap[level] || '📢 Sinh hoạt chung',
    date: dateStr,
    author,
    body
  });
  localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));

  e.target.reset();
  closeModal('modal-admin');
  renderHome();
  renderNoticesPage();
  showToast('Đã đăng thông báo mới lên trang chủ!', '📢');
}

function adminAddEvent(e) {
  e.preventDefault();
  const title = document.getElementById('adm-ev-title').value.trim();
  const day = document.getElementById('adm-ev-day').value.trim();
  const month = document.getElementById('adm-ev-month').value.trim();
  const time = document.getElementById('adm-ev-time').value.trim();
  const location = document.getElementById('adm-ev-location').value.trim();
  if (!title || !day || !month) return;

  const events = getEvents();
  events.unshift({
    id: 'ev-' + Date.now(),
    day,
    month,
    time,
    title,
    location,
    audience: 'Bà con nhân dân Thôn An Sơn'
  });
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));

  e.target.reset();
  closeModal('modal-admin');
  renderHome();
  renderCalendarPage();
  showToast('Đã thêm sự kiện mới vào Lịch thôn!', '📅');
}

function adminAddNews(e) {
  e.preventDefault();
  const title = document.getElementById('adm-news-title').value.trim();
  const tag = document.getElementById('adm-news-tag').value.trim() || 'Tin thôn An Sơn';
  const summary = document.getElementById('adm-news-summary').value.trim();
  if (!title || !summary) return;

  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  const news = getNews();
  news.unshift({ id: 'news-' + Date.now(), tag, date: dateStr, title, summary });
  localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(news));

  e.target.reset();
  closeModal('modal-admin');
  renderNewsPage();
  showToast('Đã đăng tin tức mới!', '📰');
}

function adminDeleteItem(type, id) {
  if (!isAdmin()) return;
  if (type === 'notice') {
    const list = getNotices().filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(list));
    renderHome();
    renderNoticesPage();
  } else if (type === 'news') {
    const list = getNews().filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(list));
    renderNewsPage();
  } else if (type === 'event') {
    const list = getEvents().filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(list));
    renderHome();
    renderCalendarPage();
  } else if (type === 'feedback') {
    const list = getFeedbacks().filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(list));
    renderFeedbackPage();
  }
  showToast('Đã xóa mục đã chọn.', '🗑️');
}

function openReplyModal(fbId) {
  const fb = getFeedbacks().find(f => f.id === fbId);
  if (!fb) return;
  document.getElementById('reply-fb-id').value = fbId;
  document.getElementById('reply-fb-status').value = fb.status || 'processing';
  document.getElementById('reply-fb-text').value = fb.reply || '';
  document.getElementById('modal-reply-fb')?.classList.remove('hidden');
}

function submitAdminReply(e) {
  e.preventDefault();
  const fbId = document.getElementById('reply-fb-id').value;
  const status = document.getElementById('reply-fb-status').value;
  const replyText = document.getElementById('reply-fb-text').value.trim();

  const feedbacks = getFeedbacks().map(fb => {
    if (fb.id === fbId) {
      return {
        ...fb,
        status,
        reply: replyText || fb.reply || (status === 'done' ? 'Ban thôn đã xử lý xong.' : 'Ban thôn đang kiểm tra xử lý.')
      };
    }
    return fb;
  });
  localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(feedbacks));
  closeModal('modal-reply-fb');
  renderFeedbackPage();
  showToast('Đã cập nhật trạng thái phản ánh!', '✅');
}

function exportBackupData() {
  const data = {
    exportedAt: new Date().toISOString(),
    notices: getNotices(),
    news: getNews(),
    events: getEvents(),
    feedbacks: getFeedbacks(),
    subscribers: getSubscribers()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `thon-an-son-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('Đã tải file sao lưu dữ liệu!', '💾');
}

function importBackupData(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data.notices)) localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(data.notices));
      if (Array.isArray(data.news)) localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(data.news));
      if (Array.isArray(data.events)) localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(data.events));
      if (Array.isArray(data.feedbacks)) localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(data.feedbacks));
      if (Array.isArray(data.subscribers)) localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(data.subscribers));
      renderAll();
      updateAdminUI();
      showToast('Đã khôi phục dữ liệu từ file sao lưu!', '📂');
    } catch {
      showToast('File sao lưu không hợp lệ.', '⚠️');
    }
    input.value = '';
  };
  reader.readAsText(file);
}

function resetDemoData() {
  localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(DEFAULT_NOTICES));
  localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(DEFAULT_NEWS));
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS));
  localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(DEFAULT_FEEDBACKS));
  renderAll();
  showToast('Đã khôi phục dữ liệu mẫu ban đầu.', '🔄');
}

// ==========================================================================
// MÃ QR, MODAL & TIỆN ÍCH
// ==========================================================================
function generateQRCodes() {
  const url = window.location.href;
  ['qrcode-page-box', 'qrcode-modal-box'].forEach(id => {
    const el = document.getElementById(id);
    if (el && typeof QRCode !== 'undefined') {
      el.innerHTML = '';
      new QRCode(el, {
        text: url,
        width: 170,
        height: 170,
        colorDark: '#064e3b',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    }
  });
}

function copyShareLink() {
  const url = window.location.href;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('Đã sao chép đường link trang Thôn An Sơn!', '🔗');
    }).catch(() => showToast('Hãy sao chép link trên thanh địa chỉ trình duyệt.', 'ℹ️'));
  } else {
    showToast('Hãy sao chép link trên thanh địa chỉ trình duyệt.', 'ℹ️');
  }
}

async function shareSiteNative() {
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Thôn An Sơn Thông Minh • Xã Cam Lộ, Quảng Trị',
        text: 'Mời bà con truy cập Cổng thông tin Thôn An Sơn Thông Minh để xem thông báo, lịch thôn và liên hệ cán bộ:',
        url
      });
      return;
    } catch {
      // Người dùng hủy chia sẻ hoặc trình duyệt từ chối -> chuyển sang copy link
    }
  }
  copyShareLink();
}

function openSubscribeModal() { document.getElementById('modal-subscribe')?.classList.remove('hidden'); }
function openQrModal() { generateQRCodes(); document.getElementById('modal-qr')?.classList.remove('hidden'); }
function openAdminModal() { updateAdminUI(); document.getElementById('modal-admin')?.classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

let toastTimer = null;
function showToast(msg, icon = '✅') {
  const toast = document.getElementById('toast');
  const iconEl = document.getElementById('toast-icon');
  const textEl = document.getElementById('toast-text');
  if (!toast) return;
  if (iconEl) iconEl.textContent = icon;
  if (textEl) textEl.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
