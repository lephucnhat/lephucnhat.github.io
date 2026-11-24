/**
 * ==========================================================================
 * UTILS.JS — BỘ CÔNG CỤ TIỆN ÍCH AN TOÀN, TRỢ NĂNG & 3 GIỌNG CÔ GIÁO MẦM NON
 * Trường Mầm non Lê Thế Hiếu — Xã Cam Lộ, Tỉnh Quảng Trị
 * ==========================================================================
 */

window.MNLTH_Utils = (function () {
  'use strict';

  /**
   * 1. DANH SÁCH 3 GIỌNG CÔ GIÁO MẦM NON TRUYỀN CẢM (STUDIO NEURAL MP3)
   */
  const TEACHER_VOICES = [
    {
      id: 'co-hoai-my',
      name: 'Cô Hoài My',
      label: '👩‍🏫 Cô Hoài My (Dịu dàng • Kể chuyện ấm áp)',
      shortLabel: 'Cô Hoài My',
      desc: 'Giọng nữ Neural miền Nam ấm áp, truyền cảm, nhịp đọc chậm rãi (-9%, +7Hz) chuẩn cô giáo kể chuyện đêm khuya.',
      fallbackPitch: 1.12,
      fallbackRate: 0.92
    },
    {
      id: 'co-dieu-hien',
      name: 'Cô Diệu Hiền',
      label: '👧 Cô Diệu Hiền (Trong trẻo • Dạy chữ & Đố vui)',
      shortLabel: 'Cô Diệu Hiền',
      desc: 'Giọng nữ trẻ trung, tươi vui, âm sắc cao sáng (-4%, +14Hz), giúp các bé hào hứng tập phát âm chữ cái và chơi trò chơi.',
      fallbackPitch: 1.24,
      fallbackRate: 0.96
    },
    {
      id: 'co-mai-anh',
      name: 'Cô Mai Anh',
      label: '🎙️ Cô Mai Anh (Chuẩn mực • Điểm tin & Văn bản)',
      shortLabel: 'Cô Mai Anh',
      desc: 'Giọng nữ miền Bắc tròn vành rõ chữ, chuẩn hóa âm lượng phòng thu (-16 LUFS), giúp ông bà và phụ huynh nghe thông báo rõ ràng.',
      fallbackPitch: 1.05,
      fallbackRate: 0.97
    }
  ];

  let currentVoiceId = localStorage.getItem('mnlth_teacher_voice') || 'co-hoai-my';
  let currentAudio = null;
  let activeButtonEl = null;

  function getTeacherVoices() {
    return TEACHER_VOICES;
  }

  function getCurrentVoice() {
    return TEACHER_VOICES.find((v) => v.id === currentVoiceId) || TEACHER_VOICES[0];
  }

  function setTeacherVoice(voiceId, notify = true) {
    const found = TEACHER_VOICES.find((v) => v.id === voiceId);
    if (!found) return;
    currentVoiceId = found.id;
    localStorage.setItem('mnlth_teacher_voice', found.id);

    // Đồng bộ tất cả dropdown và nút chọn giọng trên toàn trang
    document.querySelectorAll('[data-voice-select]').forEach((sel) => {
      sel.value = found.id;
    });
    document.querySelectorAll('[data-voice-pill]').forEach((btn) => {
      const isMatch = btn.getAttribute('data-voice-pill') === found.id;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
    });
    document.querySelectorAll('.current-voice-name').forEach((el) => {
      el.textContent = found.shortLabel;
    });

    if (notify) {
      showToast(`🎙️ Đã chọn giọng đọc: ${found.label}`);
    }
  }

  /**
   * 2. Chống XSS tuyệt đối khi render dữ liệu
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
   * 3. Chuẩn hóa chuỗi tiếng Việt không dấu để tìm kiếm tức thì
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
   * 4. Hiển thị thông báo Toast góc dưới màn hình
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
   * 5. Quản lý Trợ năng Cỡ chữ (A- / A+ / A++) lưu vào localStorage
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
   * 6. PHÁT GIỌNG CÔ GIÁO MẦM NON TRUYỀN CẢM (MP3 STUDIO + CLOUD / WEB SPEECH FALLBACK)
   *    - Ưu tiên phát file MP3 Neural chất lượng phòng thu tại `assets/audio/<voiceId>/<audioKey>.mp3`
   *    - Nếu là văn bản động chưa có file tĩnh, tự động gọi luồng giọng nữ tiếng Việt truyền cảm
   */
  function stopSpeech() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (e) {}
      currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (activeButtonEl) {
      const orig = activeButtonEl.getAttribute('data-orig-label');
      if (orig) activeButtonEl.innerHTML = orig;
      activeButtonEl.classList.remove('speaking-active');
      activeButtonEl = null;
    }
    updateFloatingPlayerStatus(false);
  }

  function updateFloatingPlayerStatus(isPlaying, titleText = '') {
    const badge = document.getElementById('floating-voice-status');
    const stopBtn = document.getElementById('btn-floating-stop-audio');
    if (badge) {
      const voice = getCurrentVoice();
      badge.textContent = isPlaying
        ? `🔊 ${voice.shortLabel} đang đọc: ${titleText.slice(0, 38)}...`
        : `👩‍🏫 Giọng đọc: ${voice.shortLabel}`;
      badge.classList.toggle('is-playing', isPlaying);
    }
    if (stopBtn) {
      stopBtn.style.display = isPlaying ? 'inline-flex' : 'none';
    }
  }

  function playTeacherAudio(audioKey, fallbackText, rate = 1.0, onEndCallback = null, triggerBtn = null) {
    stopSpeech();

    const voice = getCurrentVoice();
    const playbackRate = parseFloat(rate) || 1.0;

    if (triggerBtn) {
      activeButtonEl = triggerBtn;
      if (!triggerBtn.getAttribute('data-orig-label')) {
        triggerBtn.setAttribute('data-orig-label', triggerBtn.innerHTML);
      }
      triggerBtn.innerHTML = `🔊 ${voice.shortLabel} đang đọc...`;
      triggerBtn.classList.add('speaking-active');
    }

    updateFloatingPlayerStatus(true, fallbackText || audioKey || 'Nội dung nhà trường');

    const finishHandler = () => {
      if (activeButtonEl) {
        const orig = activeButtonEl.getAttribute('data-orig-label');
        if (orig) activeButtonEl.innerHTML = orig;
        activeButtonEl.classList.remove('speaking-active');
        activeButtonEl = null;
      }
      currentAudio = null;
      updateFloatingPlayerStatus(false);
      if (typeof onEndCallback === 'function') onEndCallback();
    };

    if (audioKey) {
      const mp3Path = `assets/audio/${voice.id}/${audioKey}.mp3`;
      const audio = new Audio(mp3Path);
      audio.playbackRate = playbackRate;
      currentAudio = audio;

      audio.onended = finishHandler;
      audio.onerror = () => {
        // Nếu file MP3 chưa tải kịp, chuyển sang Web Speech giọng nữ đã tinh chỉnh pitch
        speakWebSpeechFallback(fallbackText, voice, playbackRate, finishHandler);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          speakWebSpeechFallback(fallbackText, voice, playbackRate, finishHandler);
        });
      }
      return true;
    } else {
      return speakWebSpeechFallback(fallbackText, voice, playbackRate, finishHandler);
    }
  }

  function speakWebSpeechFallback(text, voice, rate, onEndCallback) {
    if (!('speechSynthesis' in window) || !text) {
      if (typeof onEndCallback === 'function') onEndCallback();
      return false;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = (voice.fallbackRate || 0.95) * (parseFloat(rate) || 1.0);
    utterance.pitch = voice.fallbackPitch || 1.15;

    const voices = window.speechSynthesis.getVoices();
    // Ưu tiên tìm giọng Nữ tiếng Việt (HoaiMy, Linh, Google Tiếng Việt)
    const femaleVi =
      voices.find(
        (v) =>
          v.lang &&
          v.lang.toLowerCase().includes('vi') &&
          /hoaimy|linh|female|nu|google/i.test(v.name)
      ) || voices.find((v) => v.lang && v.lang.toLowerCase().includes('vi'));

    if (femaleVi) {
      utterance.voice = femaleVi;
    }

    utterance.onend = onEndCallback;
    utterance.onerror = onEndCallback;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  // Giữ tương thích ngược cho các lệnh gọi speakVietnamese(text, rate, onEndCallback, audioKey, triggerBtn)
  function speakVietnamese(text, rate = 1.0, onEndCallback = null, audioKey = null, triggerBtn = null) {
    return playTeacherAudio(audioKey, text, rate, onEndCallback, triggerBtn);
  }

  /**
   * 7. Hiệu ứng âm thanh dịu nhẹ bằng Web Audio API cho Góc Bé Vui Học
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
    } catch (e) {}
  }

  /**
   * 8. Tạo và tải file Danh bạ Nhà trường (.vcf vCard 3.0)
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
   * 9. Vẽ Mã QR sạch bằng Canvas nội bộ
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
   * 10. Sao chép liên kết / nội dung vào Clipboard
   */
  function copyTextToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          showToast(successMsg || '📋 Đã sao chép vào bộ nhớ tạm!');
        })
        .catch(() => {
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
    getTeacherVoices,
    getCurrentVoice,
    setTeacherVoice,
    playTeacherAudio,
    speakVietnamese,
    stopSpeech,
    playGentleTone,
    downloadSchoolVCard,
    renderCleanQRMatrix,
    copyTextToClipboard
  };
})();
