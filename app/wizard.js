const STORAGE_KEY = 'streamingWizardStateV1';

const state = {
  step: 0,
  data: {
    platform: '',
    budgetOk: false,
    rdRegistered: false,
    rdSubscribed: false,
    rdToken: '',
    saveToken: false,
    stremioInstalled: false,
    addonConfigured: false,
    playbackOk: false,
    issue: ''
  }
};

const troubleshootingMap = {
  '无片源': ['检查 Torrentio 配置是否绑定了 Real-Debrid。', '确认 RD 订阅仍有效。', '换一部热门片测试，排除冷门资源问题。'],
  '卡顿/缓冲': ['优先选择缓存状态更好的源（通常体积更大也更稳）。', '在播放器中降低分辨率做对照测试。', '检查家庭网络/路由器 QoS 设置。'],
  '字幕不可用': ['切换不同字幕源再试。', '优先测试热门影片，字幕覆盖更全。', '确认播放器字幕开关已启用。'],
  '登录异常': ['重新登录 Stremio 与 RD。', '检查系统时间是否正确（影响鉴权）。', '尝试退出后重开客户端。'],
  '插件未生效': ['回到配置页重新安装插件。', '确认当前登录的是同一个 Stremio 账号。', '强制刷新客户端并重试。']
};

const steps = [
  {
    title: 'Step 1 · 前置检查',
    render: () => `
      <h2>前置检查</h2>
      <ul>
        <li>预算：约 $3/月</li>
        <li>设备：电脑（首次配置）+ 你的播放设备</li>
        <li>网络：可正常访问 Stremio / Real-Debrid 网站</li>
      </ul>
      <label><input type="checkbox" id="budgetOk" ${state.data.budgetOk?'checked':''}/> 我接受每月约 $3 成本</label>
      <label>主要设备平台
        <select id="platform">
          <option value="">请选择</option>
          ${['Windows','macOS','iOS/iPadOS','tvOS','Android TV/盒子'].map(p=>`<option ${state.data.platform===p?'selected':''}>${p}</option>`).join('')}
        </select>
      </label>
      <p class="small">建议：先用电脑完成首次配置，再同步到电视或移动设备。</p>
    `,
    valid: () => state.data.budgetOk && !!state.data.platform,
    invalidHint: '请先勾选预算并选择平台。'
  },
  {
    title: 'Step 2 · Real-Debrid 账号与订阅',
    render: () => `
      <h2>Real-Debrid</h2>
      <p>先完成注册和订阅（推荐先选月付测试）。</p>
      <p class="small">链接：<a href="https://real-debrid.com/premium" target="_blank">https://real-debrid.com/premium</a></p>
      <label><input type="checkbox" id="rdRegistered" ${state.data.rdRegistered?'checked':''}/> 已注册 RD 账号</label>
      <label><input type="checkbox" id="rdSubscribed" ${state.data.rdSubscribed?'checked':''}/> 已完成订阅</label>
    `,
    valid: () => state.data.rdRegistered && state.data.rdSubscribed,
    invalidHint: '请先完成 RD 注册和订阅。'
  },
  {
    title: 'Step 3 · 获取 API Token',
    render: () => `
      <h2>获取 RD Token</h2>
      <p class="small">打开：<a href="https://real-debrid.com/apitoken" target="_blank">https://real-debrid.com/apitoken</a></p>
      <label>粘贴 Token（仅本地会话使用）
        <input id="rdToken" type="password" value="${state.data.rdToken}" placeholder="rd token" />
      </label>
      <label><input type="checkbox" id="saveToken" ${state.data.saveToken?'checked':''}/> 允许保存到浏览器本地（默认不保存）</label>
      <p class="warn small">建议：默认不保存；仅在你自己的设备勾选保存。</p>
    `,
    valid: () => state.data.rdToken.trim().length >= 8,
    invalidHint: '请先粘贴有效 token。'
  },
  {
    title: 'Step 4 · 安装 Stremio 与插件',
    render: () => `
      <h2>安装与配置</h2>
      <ul>
        <li>安装 Stremio：<a href="https://www.stremio.com/downloads" target="_blank">官方下载</a></li>
        <li>注册并登录 Stremio 账号</li>
        <li>配置核心插件：<a href="https://torrentio.strem.fun/configure" target="_blank">Torrentio Configure</a></li>
      </ul>
      <label><input type="checkbox" id="stremioInstalled" ${state.data.stremioInstalled?'checked':''}/> 已安装并登录 Stremio</label>
      <label><input type="checkbox" id="addonConfigured" ${state.data.addonConfigured?'checked':''}/> 已完成 Torrentio + RD 配置</label>
    `,
    valid: () => state.data.stremioInstalled && state.data.addonConfigured,
    invalidHint: '请先完成安装并配置插件。'
  },
  {
    title: 'Step 5 · 播放验证',
    render: () => `
      <h2>播放验证</h2>
      <p>在 Stremio 搜索一个常见片源，确认能正常播放、切换字幕。</p>
      <label><input type="checkbox" id="playbackOk" ${state.data.playbackOk?'checked':''}/> 已验证可播放</label>
      <label>若失败，选择最接近的问题
        <select id="issue">
          <option value="">无</option>
          ${['无片源','卡顿/缓冲','字幕不可用','登录异常','插件未生效'].map(i=>`<option ${state.data.issue===i?'selected':''}>${i}</option>`).join('')}
        </select>
      </label>
      ${state.data.issue ? `<div class="summary"><strong>排障建议：</strong>\n- ${troubleshootingMap[state.data.issue].join('\n- ')}</div>` : ''}
    `,
    valid: () => state.data.playbackOk || !!state.data.issue,
    invalidHint: '请确认播放结果，或选择一个故障项。'
  },
  {
    title: 'Step 6 · 配置摘要与导出',
    render: () => {
      const tokenMask = state.data.rdToken
        ? `${'*'.repeat(Math.max(4, state.data.rdToken.length - 4))}${state.data.rdToken.slice(-4)}`
        : '(未填)';
      return `
        <h2>完成摘要</h2>
        <div id="summaryText" class="summary">${buildSummary(tokenMask)}</div>
        <div class="actions" style="margin-top:10px;">
          <button id="copySummaryBtn">复制摘要</button>
          <button id="downloadJsonBtn">下载 JSON</button>
          <button id="restartBtn">重新开始</button>
        </div>
        <p class="small">建议：保存这页截图或 JSON，后续排障会非常快。</p>
      `;
    },
    valid: () => true,
    invalidHint: ''
  }
];

function buildSummary(tokenMask) {
  return `平台：${state.data.platform || '(未选)'}
预算接受：${state.data.budgetOk ? '是' : '否'}
RD 注册：${state.data.rdRegistered ? '是' : '否'}
RD 订阅：${state.data.rdSubscribed ? '是' : '否'}
Token：${tokenMask}
Stremio 安装：${state.data.stremioInstalled ? '是' : '否'}
插件配置：${state.data.addonConfigured ? '是' : '否'}
播放验证：${state.data.playbackOk ? '通过' : '未通过'}
故障项：${state.data.issue || '无'}
下一步：${state.data.playbackOk ? '可直接开始日常使用。' : '按故障建议逐项排查。'}`;
}

function persistState() {
  const copy = JSON.parse(JSON.stringify(state));
  if (!copy.data.saveToken) copy.data.rdToken = '';
  localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
}

function restoreState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    Object.assign(state, parsed);
  } catch (_) {}
}

function bindInputs() {
  const ids = ['budgetOk','platform','rdRegistered','rdSubscribed','rdToken','saveToken','stremioInstalled','addonConfigured','playbackOk','issue'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const eventName = el.tagName === 'INPUT' && el.type === 'text' ? 'input' : 'change';
    el.addEventListener(eventName, () => {
      state.data[id] = el.type === 'checkbox' ? el.checked : el.value;
      persistState();
      render();
    });
  });

  const copyBtn = document.getElementById('copySummaryBtn');
  if (copyBtn) {
    copyBtn.onclick = async () => {
      const text = document.getElementById('summaryText')?.innerText || '';
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = '已复制';
      setTimeout(()=>copyBtn.textContent='复制摘要',1200);
    };
  }

  const downloadBtn = document.getElementById('downloadJsonBtn');
  if (downloadBtn) {
    downloadBtn.onclick = () => {
      const exportData = {...state.data, rdToken: state.data.saveToken ? state.data.rdToken : '(masked)'};
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'streaming-setup-summary.json';
      a.click();
      URL.revokeObjectURL(a.href);
    };
  }

  const restartBtn = document.getElementById('restartBtn');
  if (restartBtn) {
    restartBtn.onclick = () => {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    };
  }
}

function render() {
  const stepDef = steps[state.step];
  document.getElementById('stepCard').innerHTML = `<h3>${stepDef.title}</h3>${stepDef.render()}`;
  document.getElementById('progressText').textContent = `进度：${state.step + 1} / ${steps.length}`;
  document.getElementById('progressBar').style.width = `${((state.step + 1) / steps.length) * 100}%`;
  document.getElementById('prevBtn').disabled = state.step === 0;
  document.getElementById('nextBtn').textContent = state.step === steps.length - 1 ? '完成' : '下一步';
  bindInputs();
}

document.getElementById('prevBtn').addEventListener('click', () => {
  if (state.step > 0) {
    state.step--;
    persistState();
    render();
  }
});

document.getElementById('nextBtn').addEventListener('click', () => {
  const stepDef = steps[state.step];
  if (!stepDef.valid()) {
    alert(stepDef.invalidHint || '请先完成当前步骤。');
    return;
  }
  if (state.step < steps.length - 1) {
    state.step++;
    persistState();
    render();
  }
});

restoreState();
render();
