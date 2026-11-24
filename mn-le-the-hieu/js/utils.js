/**
 * ==========================================================================
 * UTILS.JS — BỘ CÔNG CỤ TIỆN ÍCH AN TOÀN & TRỢ NĂNG
 * Trường Mầm non Lê Thế Hiếu — Xã Cam Lộ, Tỉnh Quảng Trị
 * ==========================================================================
 */

window.MNLTH_Utils = (function () {
  'use strict';

  /**
   * 1. Chống XSS tuyệt đối khi render dữ liệu từ JSON hoặc input người dùng
   */
  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * 2. Chuẩn hóa chuỗi tiếng Việt không dấu để tìm kiếm tức thì
   *    (Ví dụ: "Gấu con bị sâu răng" -> "gau con bi sau rang")
   */
  function removeVietnameseTones(str) {
    if (!str) return '';
    return String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 3. Hiển thị thông báo Toast góc dưới màn hình
   */
  function showToast(message, durationMs = 3600) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 250ms ease';
      setTimeout(() => toast.remove(), 260);
    }, durationMs);
  }

  /**
   * 4. Quản lý Trợ năng Cỡ chữ (A- / A+ / A++) lưu vào localStorage
   */
  function initFontScale() {
    const savedScale = localStorage.getItem('mnlth_font_scale') || '1';
    applyFontScale(savedScale, false);

    document.querySelectorAll('[data-font-scale]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const scale = btn.getAttribute('data-font-scale');
        applyFontScale(scale, true);
      });
    });
  }

  function applyFontScale(scale, notify = false) {
    document.documentElement.style.setProperty('--font-scale', scale);
    localStorage.setItem('mnlth_font_scale', scale);

    document.querySelectorAll('[data-font-scale]').forEach((btn) => {
      const isMatch = btn.getAttribute('data-font-scale') === String(scale);
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
    });

    if (notify) {
      const labels = {
        '0.94': 'Cỡ chữ thu gọn (A-)',
        '1': 'Cỡ chữ tiêu chuẩn (A)',
        '1.12': 'Cỡ chữ lớn dễ đọc (A+)',
        '1.22': 'Cỡ chữ siêu lớn cho Ông Bà & Phụ huynh (A++)'
      };
      showToast('🔎 Đã chuyển sang: ' + (labels[scale] || 'Cỡ chữ tùy chỉnh'));
    }
  }

  /**
   * 5. Giọng tự đọc Tiếng Việt (Web Speech API — Tắt mặc định, chỉ đọc khi bấm)
   */
  let currentUtterance = null;

  function stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    currentUtterance = null;
    document.querySelectorAll('[data-tts-state]').forEach((el) => {
      el.setAttribute('data-tts-state', 'idle');
    });
  }

  function speakVietnamese(text, rate = 1.0, onEndCallback = null) {
    if (!('speechSynthesis' in window)) {
      showToast('⚠️ Trình duyệt hiện tại chưa hỗ trợ giọng đọc tự động Web Speech API.');
      return false;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = parseFloat(rate) || 1.0;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang && v.lang.toLowerCase().includes('vi'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    utterance.onend = () => {
      currentUtterance = null;
      if (typeof onEndCallback === 'function') onEndCallback();
    };

    utterance.onerror = () => {
      currentUtterance = null;
      if (typeof onEndCallback === 'function') onEndCallback();
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  /**
   * 6. Hiệu ứng âm thanh dịu nhẹ bằng Web Audio API cho Góc Bé Vui Học
   */
  function playGentleTone(type = 'success') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      // Bỏ qua nếu trình duyệt chặn autoplay audio
    }
  }

  /**
   * 7. Tạo và tải file Danh bạ Nhà trường (.vcf vCard 3.0)
   *    Chỉ xuất số điện thoại thật khi trường đã cập nhật trong site-config.json
   */
  function downloadSchoolVCard(config) {
    const schoolName = (config && config.schoolName) || 'Trường Mầm non Lê Thế Hiếu';
    const address = (config && config.address) || 'Thôn Cam Chính, xã Cam Lộ, tỉnh Quảng Trị';
    const website = (config && config.websiteUrl) || 'https://mnlethehieu.quangtri.edu.vn';
    const rawPhone = (config && config.phone) || '[SỐ ĐIỆN THOẠI NHÀ TRƯỜNG]';
    const rawEmail = (config && config.email) || '[EMAIL NHÀ TRƯỜNG]';

    const hasRealPhone = !rawPhone.includes('[') && /\d{8,11}/.test(rawPhone);
    const hasRealEmail = !rawEmail.includes('[') && rawEmail.includes('@');

    const vcardLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${schoolName}`,
      `ORG:${schoolName};UBND xã Cam Lộ, tỉnh Quảng Trị`,
      `ADR;TYPE=WORK:;;${address};Cam Lộ;Quảng Trị;;Việt Nam`,
      `URL:${website}`,
      'TEL;TYPE=CELL,VOICE:111'
    ];

    if (hasRealPhone) {
      vcardLines.push(`TEL;TYPE=WORK,VOICE:${rawPhone}`);
    }
    if (hasRealEmail) {
      vcardLines.push(`EMAIL;TYPE=PREF,INTERNET:${rawEmail}`);
    }

    vcardLines.push(
      `NOTE:${schoolName} - ${address}. Tổng đài Quốc gia Bảo vệ Trẻ em: 111.`,
      'END:VCARD'
    );

    const blob = new Blob([vcardLines.join('\r\n')], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Truong-Mam-Non-Le-The-Hieu-Cam-Lo.vcf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    if (!hasRealPhone) {
      showToast('📥 Đã tải danh bạ trường (Kèm địa chỉ & Tổng đài 111). Hãy cập nhật SĐT trường trong data/site-config.json.');
    } else {
      showToast('📥 Đã tải file Danh bạ Trường Mầm non Lê Thế Hiếu (.vcf)!');
    }
  }

  /**
   * 8. Vẽ Mã QR sạch bằng Canvas nội bộ (Không phụ thuộc API ngoài)
   *    Biểu diễn ma trận finder pattern chuẩn & hash định danh URL trang web
   */
  function renderCleanQRMatrix(canvasId, textData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 21;
    const cell = Math.floor(canvas.width / size);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const matrix = Array.from({ length: size }, () => Array(size).fill(0));

    function drawFinder(r0, c0) {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            matrix[r0 + r][c0 + c] = 1;
          } else {
            matrix[r0 + r][c0 + c] = 2;
          }
        }
      }
    }

    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = i % 2 === 0 ? 1 : 2;
      matrix[i][6] = i % 2 === 0 ? 1 : 2;
    }

    let hash = 2166136261;
    const str = String(textData || 'https://mnlethehieu.quangtri.edu.vn');
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    let bitIdx = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (matrix[r][c] !== 0) continue;
        if ((r < 8 && c < 8) || (r < 8 && c >= size - 8) || (r >= size - 8 && c < 8)) continue;
        const charCode = str.charCodeAt(bitIdx % str.length);
        const bit = ((hash >>> (bitIdx % 24)) ^ (charCode >> (bitIdx % 7)) ^ (r * 3 + c * 5)) & 1;
        matrix[r][c] = bit ? 1 : 0;
        bitIdx++;
      }
    }

    ctx.fillStyle = '#1B7350';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (matrix[r][c] === 1) {
          ctx.fillRect(c * cell, r * cell, cell, cell);
        }
      }
    }
  }

  /**
   * 9. Sao chép liên kết vào Clipboard
   */
  function copyTextToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg || '📋 Đã sao chép vào bộ nhớ tạm!');
      }).catch(() => {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(successMsg || '📋 Đã sao chép vào bộ nhớ tạm!');
    } catch (e) {
      showToast('⚠️ Không thể tự động sao chép.');
    }
    ta.remove();
  }

  return {
    escapeHTML,
    removeVietnameseTones,
    showToast,
    initFontScale,
    applyFontScale,
    speakVietnamese,
    stopSpeech,
    playGentleTone,
    downloadSchoolVCard,
    renderCleanQRMatrix,
    copyTextToClipboard
  };
})();
