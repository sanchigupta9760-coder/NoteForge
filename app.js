// Application State Store
const state = {
  currentScreen: 'dashboard',
  subjects: [
    { id: 'math', name: 'Mathematics', notesCount: 5, weakCount: 3, color: '#6366F1', updated: 'Today' },
    { id: 'physics', name: 'Physics', notesCount: 3, weakCount: 1, color: '#8B5CF6', updated: 'Yesterday' },
    { id: 'chemistry', name: 'Chemistry', notesCount: 2, weakCount: 0, color: '#10B981', updated: '3 days ago' }
  ],
  notes: [
    { id: '01', title: 'Integration', subjectId: 'math', subject: 'Mathematics', added: 'Added today', type: 'Handwritten JPG' },
    { id: '02', title: 'Thermodynamics', subjectId: 'physics', subject: 'Physics', added: 'Added yesterday', type: 'Document PDF' },
    { id: '03', title: 'Organic Chemistry', subjectId: 'chemistry', subject: 'Chemistry', added: 'Added 3 days ago', type: 'Text Doc' }
  ],
  weakTopics: [
    { id: 'entropy', name: 'Entropy', subject: 'Physics', mistakes: 4, status: 'Weak' },
    { id: 'thermo-eq', name: 'Thermodynamic Equilibrium', subject: 'Physics', mistakes: 3, status: 'Weak' },
    { id: 'integration-weak', name: 'Integration', subject: 'Mathematics', mistakes: 2, status: 'Weak' }
  ],
  studyTasks: [
    { id: 't1', topic: 'Entropy', subject: 'Physics', date: '2026-09-20', status: 'Pending' },
    { id: 't2', topic: 'Thermodynamic Equilibrium', subject: 'Physics', date: '2026-09-22', status: 'Pending' }
  ]
};

// Application Router & Screen Switcher
function navigateTo(screenId, params = {}) {
  state.currentScreen = screenId;
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

  const navBtn = document.querySelector(`.nav-item[data-screen="${screenId}"]`);
  if (navBtn) navBtn.classList.add('active');

  const targetScreen = document.getElementById(`screen-${screenId}`);
  if (targetScreen) {
    targetScreen.classList.add('active');
    renderScreen(screenId, params);
  }
}

// Master Render Engine
function renderScreen(screenId, params) {
  const container = document.getElementById(`screen-${screenId}`);
  
  switch(screenId) {
    case 'dashboard':
      container.innerHTML = renderDashboard();
      break;
    case 'subjects':
      container.innerHTML = renderSubjects();
      break;
    case 'subject-detail':
      container.innerHTML = renderSubjectDetail(params.subjectId || 'math');
      break;
    case 'study-resource':
      container.innerHTML = renderStudyResourceHub();
      setupTabListeners();
      break;
    case 'study-plan':
      container.innerHTML = renderStudyPlan();
      break;
    case 'weak-topics':
      container.innerHTML = renderWeakTopics();
      break;
  }
}

// 1. Dashboard Renderer
function renderDashboard() {
  return `
    <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
      <div>
        <h2>Good evening 👋</h2>
        <p style="color: var(--text-muted);">Turn your notes into knowledge.</p>
      </div>
      <button class="btn-primary" onclick="window.openUploadModal()">+ Upload New Notes</button>
    </header>

    <section style="margin-bottom: 32px;">
      <h3>Your Subjects</h3>
      <div class="grid-3" style="margin-top: 16px;">
        ${state.subjects.map(sub => `
          <div class="card">
            <h4>${sub.name}</h4>
            <p style="color: var(--text-muted); font-size: 14px; margin: 8px 0 16px;">${sub.notesCount} Notes • ${sub.weakCount} Weak Topics</p>
            <button class="btn-primary" style="width: 100%;" onclick="window.navigateTo('subject-detail', {subjectId: '${sub.id}'})">Open Subject</button>
          </div>
        `).join('')}
      </div>
    </section>

    <div class="dual-workspace">
      <div class="card">
        <h3>Your Weak Topics</h3>
        <div style="margin-top: 16px;">
          ${state.weakTopics.map(t => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span>${t.name}</span>
              <span style="color: var(--danger); font-weight: 600;">${t.mistakes} mistakes</span>
            </div>
          `).join('')}
        </div>
        <button class="btn-primary" style="margin-top: 16px; width: 100%;" onclick="navigateTo('weak-topics')">View All Weak Topics</button>
      </div>

      <div class="card">
        <h3>Upcoming Study Tasks</h3>
        <div style="margin-top: 16px;">
          ${state.studyTasks.map(task => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; align-items: center;">
              <div>
                <strong>${task.topic}</strong>
                <p style="font-size: 12px; color: var(--text-muted);">${task.subject}</p>
              </div>
              <span style="background: #EEF2FF; color: var(--primary); padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 12px;">${task.date}</span>
            </div>
          `).join('')}
        </div>
        <button class="btn-primary" style="margin-top: 16px; width: 100%;" onclick="navigateTo('study-plan')">Open Study Plan</button>
      </div>
    </div>
  `;
}

// 2. Upload & AI Processing Modal Flow
window.openUploadModal = function() {
  const modal = document.getElementById('modal-container');
  const modalContent = document.getElementById('modal-content');
  modal.classList.remove('hidden');

  modalContent.innerHTML = `
    <h3>Upload Your Notes</h3>
    <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">Turn handwritten or typed notes into your personal study system.</p>
    <div id="dropzone" style="border: 2px dashed var(--primary); padding: 40px; text-align: center; border-radius: 12px; background: #EEF2FF; cursor: pointer;">
      <p style="font-weight: 600; color: var(--primary);">Drop your notes here or Browse Files</p>
      <p style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">PDF • TXT • JPG • JPEG • PNG | ✨ Typed & handwritten supported</p>
    </div>
    <div id="file-preview" style="display: none; margin-top: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; background: var(--canvas-bg); padding: 12px; border-radius: 8px;">
        <span>📄 handwritten-notes.jpg</span>
        <span style="background: var(--success); color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">✓ Ready for OCR</span>
      </div>
      <button class="btn-primary" style="width: 100%; margin-top: 16px;" onclick="window.triggerAIProcessing()">Generate Study Resources</button>
    </div>
  `;

  document.getElementById('dropzone').onclick = () => {
    document.getElementById('file-preview').style.display = 'block';
  };
};

window.triggerAIProcessing = function() {
  const modalContent = document.getElementById('modal-content');
  const steps = [
    '✓ Reading your notes',
    '● Understanding handwriting (OCR)',
    '○ Extracting concepts',
    '○ Creating study resources',
    '○ Preparing quiz'
  ];

  modalContent.innerHTML = `
    <h3>AI Processing Engine</h3>
    <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">Analyzing handwritten-notes.jpg...</p>
    <div id="processing-checklist" style="display: flex; flex-direction: column; gap: 12px;">
      ${steps.map(step => `<div style="font-weight: 500; font-size: 14px;">${step}</div>`).join('')}
    </div>
  `;

  setTimeout(() => {
    document.getElementById('modal-container').classList.add('hidden');
    navigateTo('study-resource');
  }, 2500);
};

// 3. Generated Study Resource Suite & Tabs
function renderStudyResourceHub() {
  return `
    <header style="margin-bottom: 24px;">
      <button class="btn-primary" style="background: none; color: var(--text-muted); padding: 0; margin-bottom: 8px;" onclick="navigateTo('subject-detail')">← Back to Mathematics</button>
      <h2>01 — Integration</h2>
      <p style="color: var(--text-muted); font-size: 14px;">Generated from handwritten-notes.jpg</p>
    </header>

    <div style="display: flex; gap: 16px; border-bottom: 1px solid var(--border-color); margin-bottom: 24px;">
      <button class="tab-btn active" data-tab="overview" style="padding: 12px 16px; border: none; background: none; font-weight: 600; cursor: pointer; border-bottom: 2px solid var(--primary);">Overview</button>
      <button class="tab-btn" data-tab="concept-map" style="padding: 12px 16px; border: none; background: none; font-weight: 600; cursor: pointer;">Concept Map</button>
      <button class="tab-btn" data-tab="flashcards" style="padding: 12px 16px; border: none; background: none; font-weight: 600; cursor: pointer;">Flashcards (8)</button>
      <button class="tab-btn" data-tab="quiz" style="padding: 12px 16px; border: none; background: none; font-weight: 600; cursor: pointer;">Quiz (5)</button>
    </div>

    <div id="tab-content">
      <!-- Overview Tab -->
      <div class="tab-pane active" id="tab-overview">
        <div class="card" style="margin-bottom: 24px;">
          <h3>AI Summary</h3>
          <p style="margin-top: 12px; line-height: 1.6; color: var(--text-muted);">
            Integration is a core branch of calculus representing the accumulation of quantities and the area under curves. It acts as the inverse operation of differentiation.
          </p>
        </div>
      </div>
    </div>
  `;
}

function setupTabListeners() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.style.borderBottom = 'none');
      e.target.style.borderBottom = '2px solid var(--primary)';
    };
  });
}

// Global Initialization
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.sidebar-menu .nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      navigateTo(e.target.getAttribute('data-screen'));
    });
  });
  navigateTo('dashboard');
});