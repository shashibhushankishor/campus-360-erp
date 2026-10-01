/**
 * Campus ERP Portal - Frontend Application Controller
 * Handles real-time 24h SLA countdowns, photo previews, role switching,
 * paperless clearance matrix, dynamic QR gate passes, mess menu voting, and CCTV desk.
 */

let currentRole = 'student';
let currentTab = 'grievances';
let activeCategoryFilter = 'all';
let ticketsData = [];
let noduesData = [];
let gatepassesData = [];
let cctvCasesData = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadInitialData();
  // Live ticker for 24h countdown every second
  setInterval(updateLiveSlaCountdowns, 1000);
});

async function loadInitialData() {
  await Promise.all([
    loadTickets(),
    loadNoDues(),
    loadFees(),
    loadGatePasses(),
    loadMessData(),
    loadCctvCases()
  ]);
  lucide.createIcons();
}

// ============================================================================
// NAVIGATION & ROLE SWITCHING
// ============================================================================
function switchTab(tabId) {
  currentTab = tabId;
  const tabs = ['grievances', 'nodues', 'fees', 'gatepass', 'mess', 'security', 'academic'];
  tabs.forEach(t => {
    const view = document.getElementById(`view-${t}`);
    const btn = document.getElementById(`tab-${t}`);
    if (view && btn) {
      if (t === tabId) {
        view.classList.remove('hidden');
        btn.classList.add('active');
      } else {
        view.classList.add('hidden');
        btn.classList.remove('active');
      }
    }
  });
  lucide.createIcons();
}

function switchUserRole(role) {
  currentRole = role;
  showToast(`Switched active persona to: ${role.toUpperCase()}`, 'info');
  // Re-render views with role privileges
  renderTickets();
  renderNoDues();
  lucide.createIcons();
}

// ============================================================================
// 1. 24-HOUR OPERATIONAL HUB (THE 5 SPECIFIC VERTICALS)
// ============================================================================
async function loadTickets() {
  try {
    const res = await fetch('/api/tickets');
    ticketsData = await res.json();
    renderTickets();
  } catch (err) {
    console.error('Failed to load tickets:', err);
  }
}

function filterTicketsByCategory(cat) {
  activeCategoryFilter = cat;
  document.querySelectorAll('.cat-pill').forEach(btn => {
    btn.classList.remove('active', 'bg-blue-600', 'text-white');
    btn.classList.add('bg-white', 'text-slate-700');
  });
  event.target.classList.add('active', 'bg-blue-600', 'text-white');
  event.target.classList.remove('bg-white', 'text-slate-700');
  renderTickets();
}

function renderTickets() {
  const container = document.getElementById('ticketsContainer');
  if (!container) return;

  const filtered = activeCategoryFilter === 'all' 
    ? ticketsData 
    : ticketsData.filter(t => t.category === activeCategoryFilter);

  document.getElementById('ticketCount').innerText = filtered.length;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-400">
        <i data-lucide="inbox" class="w-12 h-12 mx-auto mb-2 text-slate-300"></i>
        <p class="text-sm font-medium">No active tickets found in this operational category.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(t => {
    const sla = t.sla;
    const isResolved = t.status === 'RESOLVED';
    const isUrgent = t.priority === 'URGENT' || sla.is_breached || sla.remaining_seconds < 14400;

    // Category badge color
    const catColors = {
      campus: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      academic: 'bg-blue-50 text-blue-800 border-blue-200',
      hostel: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      mess: 'bg-amber-50 text-amber-800 border-amber-200',
      security: 'bg-red-50 text-red-800 border-red-200'
    };
    const catBadge = catColors[t.category] || 'bg-slate-100 text-slate-800 border-slate-200';

    return `
      <div class="bg-white border ${isUrgent && !isResolved ? 'border-red-300 shadow-md ring-1 ring-red-100' : 'border-slate-200'} rounded-2xl p-5 hover-card flex flex-col justify-between">
        <div>
          <!-- Header: Category & SLA Status -->
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${catBadge}">
              ${t.category.toUpperCase()} • ${t.subcategory}
            </span>
            <span class="text-xs font-mono font-bold px-2 py-0.5 rounded ${sla.is_breached ? 'bg-red-600 text-white pulse-urgent' : sla.badge_color === 'red' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}">
              ${isResolved ? 'RESOLVED' : sla.badge_text}
            </span>
          </div>

          <h3 class="font-bold text-slate-900 text-sm mb-1 leading-snug">${t.title}</h3>
          <p class="text-xs text-slate-600 line-clamp-2 mb-3">${t.description}</p>

          <!-- Location & Reporter -->
          <div class="flex items-center space-x-2 text-[11px] text-slate-500 mb-3 bg-slate-50 p-2 rounded-lg">
            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400 shrink-0"></i>
            <span class="truncate font-medium">${t.location}</span>
          </div>

          <!-- Photo Evidence Attachment if any -->
          ${t.photo_url ? `
            <div class="mb-3 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
              <img src="/static/uploads/${t.photo_url}" alt="Evidence" class="w-full h-32 object-cover transition duration-300 group-hover:scale-105">
              <div class="absolute bottom-1 left-2 bg-black/70 backdrop-blur-sm text-[10px] text-white px-2 py-0.5 rounded font-mono">
                PHOTO EVIDENCE [24H SLA]
              </div>
            </div>
          ` : ''}

          <!-- Video Evidence if Security CCTV -->
          ${t.video_clip_url ? `
            <div class="mb-3 p-2 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs">
              <div class="flex items-center space-x-2 text-red-800 font-semibold">
                <i data-lucide="film" class="w-4 h-4 text-red-600"></i>
                <span>CCTV Video Clip Attached</span>
              </div>
              <button onclick="switchTab('security')" class="text-[11px] bg-red-600 text-white px-2 py-1 rounded font-bold hover:bg-red-500">
                View Clip
              </button>
            </div>
          ` : ''}

          <!-- Live 24H SLA Countdown Card -->
          <div class="p-2.5 rounded-xl ${isResolved ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-900 text-white'} mb-3">
            <div class="flex items-center justify-between text-[11px] font-mono">
              <span class="${isResolved ? 'text-emerald-800 font-bold' : 'text-slate-400'}">24h SLA Countdown:</span>
              <span class="${isResolved ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold'} ticket-timer" data-deadline="${t.sla_deadline}" data-status="${t.status}">
                ${sla.remaining_formatted}
              </span>
            </div>
            <!-- Progress Bar -->
            <div class="w-full bg-slate-700/50 h-1.5 rounded-full mt-2 overflow-hidden">
              <div class="${isResolved ? 'bg-emerald-500' : sla.pct_elapsed > 80 ? 'bg-red-500' : 'bg-blue-500'} h-full transition-all duration-500" style="width: ${sla.pct_elapsed}%"></div>
            </div>
          </div>

          ${t.resolution_notes ? `
            <div class="text-[11px] bg-blue-50/70 border border-blue-100 text-blue-900 p-2.5 rounded-xl mb-3">
              <span class="font-bold block">Resolution Notes (${t.assigned_to || 'Staff'}):</span>
              ${t.resolution_notes}
            </div>
          ` : ''}
        </div>

        <!-- Footer Actions -->
        <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-slate-400 font-mono text-[11px]">${t.ticket_id}</span>
          <div class="flex items-center space-x-2">
            ${!isResolved ? `
              <button onclick="openResolveModal('${t.ticket_id}')" class="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg font-semibold text-[11px] transition">
                Update / Resolve
              </button>
            ` : `
              <span class="text-emerald-600 font-bold text-[11px] flex items-center space-x-1">
                <i data-lucide="check" class="w-3.5 h-3.5"></i>
                <span>Resolved</span>
              </span>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function updateLiveSlaCountdowns() {
  const timerElements = document.querySelectorAll('.ticket-timer');
  const now = new Date().getTime();

  timerElements.forEach(el => {
    const status = el.getAttribute('data-status');
    if (status === 'RESOLVED') return;

    const deadlineStr = el.getAttribute('data-deadline');
    if (!deadlineStr) return;

    // Parse MySQL-like string to timestamp
    const deadline = new Date(deadlineStr.replace(' ', 'T')).getTime();
    const diff = deadline - now;

    if (diff <= 0) {
      el.innerText = 'EXCEEDED (Escalated to Dean)';
      el.className = 'text-red-400 font-bold ticket-timer';
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      el.innerText = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s remaining`;
    }
  });
}

function updateSubcategories(cat) {
  const subSelect = document.getElementById('ticketSubcategory');
  const options = {
    campus: [
      'Streetlights & Pathway Lighting',
      'Road & Pavement Repair',
      'Classroom Projector / AC',
      'Campus Garden & Ground Cleanliness',
      'Drainage & Water Drainage Puddle'
    ],
    academic: [
      'Server Load & Elective Selection Timeout',
      'Grade Discrepancy & Marksheet Download',
      'Exam Hall Ticket Portal Glitch',
      'Classroom Attendance Sync Failure'
    ],
    hostel: [
      'Plumbing & Over water flow',
      'Broken Gate / Door Latch (gate tuta hua hai)',
      'Cleanliness & Corridor Garbage',
      'Electricity, Fan & Light Repair',
      'Hostel Room Wi-Fi Router Down'
    ],
    mess: [
      'Mess Food Taste & Under-cooked Food',
      'Handwash Sink & Drinking RO Water Cooler',
      'Mess Hall Cleanliness & Wet Tables',
      'Staff Hairnet & Glove Hygiene'
    ],
    security: [
      'Theft: Stolen Bicycle / Mountain Bike',
      'Theft: Stolen Laptop / Tablet',
      'Theft: Stolen Smartphone / Wallet',
      'Urgent CCTV Camera Footage Review Request'
    ]
  };

  const list = options[cat] || ['General Inquiry'];
  subSelect.innerHTML = list.map(item => `<option value="${item}">${item}</option>`).join('');
}

function previewTicketPhoto(input) {
  const container = document.getElementById('photoPreviewContainer');
  const img = document.getElementById('photoPreviewImg');
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      img.src = e.target.result;
      container.classList.remove('hidden');
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function handleTicketSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('formNewTicket');
  const formData = new FormData();
  formData.append('category', document.getElementById('ticketCategory').value);
  formData.append('subcategory', document.getElementById('ticketSubcategory').value);
  formData.append('title', document.getElementById('ticketTitle').value);
  formData.append('location', document.getElementById('ticketLocation').value);
  formData.append('description', document.getElementById('ticketDescription').value);
  formData.append('student_id', 'STU202401');

  const photoInput = document.getElementById('ticketPhotoInput');
  if (photoInput.files && photoInput.files[0]) {
    formData.append('photo', photoInput.files[0]);
  }

  try {
    const res = await fetch('/api/tickets/create', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    showToast(data.message, 'success');
    closeModal('modalNewTicket');
    form.reset();
    document.getElementById('photoPreviewContainer').classList.add('hidden');
    await loadTickets();
  } catch (err) {
    showToast('Failed to create ticket', 'error');
  }
}

function openResolveModal(ticketId) {
  document.getElementById('resolveTicketId').value = ticketId;
  openModal('modalResolveTicket');
}

async function executeTicketResolution() {
  const ticketId = document.getElementById('resolveTicketId').value;
  const status = document.getElementById('resolveStatusSelect').value;
  const notes = document.getElementById('resolveNotes').value || 'Issue inspected and verified fixed.';
  const staff = document.getElementById('resolveAssignedStaff').value;

  try {
    const res = await fetch('/api/tickets/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticket_id: ticketId,
        status: status,
        resolution_notes: notes,
        assigned_to: staff
      })
    });
    const data = await res.json();
    showToast(data.message, 'success');
    closeModal('modalResolveTicket');
    await loadTickets();
  } catch (err) {
    showToast('Failed to update resolution', 'error');
  }
}

// ============================================================================
// 2. PAPERLESS NO-DUES CLEARANCE MATRIX
// ============================================================================
async function loadNoDues() {
  try {
    const res = await fetch('/api/nodues');
    noduesData = await res.json();
    renderNoDues();
  } catch (err) {
    console.error('Failed to load No-Dues:', err);
  }
}

function renderNoDues() {
  const container = document.getElementById('noduesListContainer');
  if (!container) return;

  if (noduesData.length === 0) {
    container.innerHTML = `<div class="p-8 text-center text-slate-400">No clearance requests initiated.</div>`;
    return;
  }

  container.innerHTML = noduesData.map(req => {
    const depts = [
      { name: 'Central Library', role: 'library', status: req.library_status, remarks: req.library_remarks, icon: 'book' },
      { name: 'Laboratories', role: 'lab', status: req.lab_status, remarks: req.lab_remarks, icon: 'flask-conical' },
      { name: 'Accounts & Finance', role: 'accounts', status: req.accounts_status, remarks: req.accounts_remarks, icon: 'badge-percent' },
      { name: 'Hostel Warden', role: 'hostel', status: req.hostel_status, remarks: req.hostel_remarks, icon: 'building' },
      { name: 'Department Head (HOD)', role: 'hod', status: req.hod_status, remarks: req.hod_remarks, icon: 'user-check' },
    ];

    const isAllApproved = req.overall_status === 'APPROVED';

    return `
      <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div class="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-6">
          <div>
            <div class="flex items-center space-x-2">
              <h3 class="font-bold text-slate-900 text-base">${req.student_name} (${req.student_id})</h3>
              <span class="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">${req.request_id}</span>
            </div>
            <p class="text-xs text-slate-500">${req.degree} • ${req.department} • Academic Year ${req.academic_year}</p>
          </div>
          <div>
            ${isAllApproved ? `
              <button onclick="viewCertificate('${req.certificate_qr}', '${req.certificate_hash}')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center space-x-2 shadow">
                <i data-lucide="award" class="w-4 h-4"></i>
                <span>Download Verified Digital Certificate</span>
              </button>
            ` : `
              <span class="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Clearance In Progress
              </span>
            `}
          </div>
        </div>

        <!-- 5-Department Step Pipeline -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          ${depts.map(d => {
            const isApproved = d.status === 'APPROVED';
            return `
              <div class="p-4 rounded-xl border ${isApproved ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <i data-lucide="${d.icon}" class="w-5 h-5 ${isApproved ? 'text-emerald-600' : 'text-slate-400'}"></i>
                    <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded ${isApproved ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-100 text-amber-800'}">
                      ${d.status}
                    </span>
                  </div>
                  <h4 class="font-bold text-xs text-slate-900">${d.name}</h4>
                  <p class="text-[11px] text-slate-500 mt-1 line-clamp-2">${d.remarks || 'Pending verification'}</p>
                </div>

                <div class="pt-3 mt-3 border-t border-slate-200/60">
                  ${!isApproved ? `
                    <button onclick="approveDepartmentNoDues('${req.request_id}', '${d.role}')" class="w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold py-1 rounded-lg">
                      1-Click Clear
                    </button>
                  ` : `
                    <span class="text-[11px] text-emerald-700 font-bold flex items-center justify-center space-x-1">
                      <i data-lucide="check" class="w-3.5 h-3.5"></i>
                      <span>Verified</span>
                    </span>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

async function approveDepartmentNoDues(requestId, role) {
  try {
    const res = await fetch('/api/nodues/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_id: requestId,
        department_role: role,
        action: 'APPROVED',
        remarks: `Digitally verified by ${role.toUpperCase()} officer with zero outstanding dues.`
      })
    });
    const data = await res.json();
    showToast(data.message, 'success');
    await loadNoDues();
  } catch (err) {
    showToast('Failed to approve', 'error');
  }
}

function viewCertificate(qr, hash) {
  document.getElementById('certQrImg').src = qr;
  document.getElementById('certHashText').innerText = hash;
  openModal('modalNoDuesCert');
}

// ============================================================================
// 3. DYNAMIC FEE & DIGITAL E-RECEIPTS
// ============================================================================
let pendingSelectedFee = null;

async function loadFees() {
  try {
    const res = await fetch('/api/fees');
    const data = await res.json();

    // Render pending fees
    const pendingContainer = document.getElementById('pendingFeesList');
    pendingContainer.innerHTML = data.pending_dues.map(f => `
      <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
        <div>
          <span class="font-bold text-xs text-slate-800 block">${f.fee_type}</span>
          <span class="text-[11px] text-slate-500">Due: ${f.due_date}</span>
        </div>
        <div class="text-right">
          <span class="font-bold text-xs text-slate-900 block">₹ ${f.amount.toLocaleString()}</span>
          <button onclick="promptPayFee('${f.fee_type}', ${f.amount})" class="mt-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold px-3 py-1 rounded-lg">
            Pay Now
          </button>
        </div>
      </div>
    `).join('');

    // Render paid ledger
    const paidTable = document.getElementById('paidFeesTable');
    paidTable.innerHTML = data.paid_transactions.map(p => `
      <tr class="hover:bg-slate-50">
        <td class="px-4 py-3 font-mono font-bold text-slate-800">${p.receipt_no}</td>
        <td class="px-4 py-3 text-slate-700">${p.fee_type}</td>
        <td class="px-4 py-3 font-bold text-slate-900">₹ ${p.amount.toLocaleString()}</td>
        <td class="px-4 py-3 font-mono text-slate-500">${p.transaction_ref}</td>
        <td class="px-4 py-3"><span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">PAID</span></td>
        <td class="px-4 py-3 text-right">
          <a href="/api/fees/receipt/${p.payment_id}" target="_blank" class="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center space-x-1">
            <i data-lucide="download" class="w-3.5 h-3.5"></i>
            <span>PDF</span>
          </a>
        </td>
      </tr>
    `).join('');

    lucide.createIcons();
  } catch (err) {
    console.error('Failed to load fees:', err);
  }
}

function promptPayFee(title, amount) {
  pendingSelectedFee = { title, amount };
  document.getElementById('modalFeeTitle').innerText = title;
  document.getElementById('modalFeeAmount').innerText = `₹ ${amount.toLocaleString()}.00`;
  openModal('modalPayFee');
}

let selectedPayModeType = 'UPI';
function selectPayMode(mode) {
  selectedPayModeType = mode;
  document.querySelectorAll('.pay-mode-btn').forEach(b => {
    b.classList.remove('border-2', 'border-blue-600', 'bg-blue-50', 'text-blue-700');
    b.classList.add('border', 'border-slate-200', 'text-slate-700');
  });
  event.target.classList.add('border-2', 'border-blue-600', 'bg-blue-50', 'text-blue-700');
}

async function executeFeePayment() {
  if (!pendingSelectedFee) return;
  const btn = document.getElementById('btnConfirmPay');
  btn.disabled = true;
  btn.innerText = 'Connecting College Clearinghouse...';

  try {
    const res = await fetch('/api/fees/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: 'STU202401',
        fee_type: pendingSelectedFee.title,
        amount: pendingSelectedFee.amount,
        payment_method: selectedPayModeType
      })
    });
    const data = await res.json();
    showToast(data.message, 'success');
    closeModal('modalPayFee');
    await loadFees();
    // Auto trigger receipt download
    window.open(`/api/fees/receipt/${data.payment_id}`, '_blank');
  } catch (err) {
    showToast('Payment processing failed', 'error');
  } finally {
    btn.disabled = false;
    btn.innerText = 'Authorize Payment & Generate E-Receipt';
  }
}

// ============================================================================
// 4. DYNAMIC QR GATE-PASS SYSTEM
// ============================================================================
async function loadGatePasses() {
  try {
    const res = await fetch('/api/gatepasses');
    gatepassesData = await res.json();

    if (gatepassesData.length > 0) {
      const active = gatepassesData[0];
      document.getElementById('currentPassTitle').innerText = `${active.pass_type} (${active.student_name})`;
      document.getElementById('currentPassDestination').innerText = `Destination: ${active.destination} | Reason: ${active.reason}`;
      document.getElementById('currentPassId').innerText = active.pass_id;
      document.getElementById('gatepassQrImage').src = active.qr_code_data;
      document.getElementById('currentPassValidity').innerText = `Valid: ${active.valid_from} to ${active.valid_until}`;
      document.getElementById('scanPassInput').value = active.pass_id;
    }

    // Render logbook
    const table = document.getElementById('gatepassLogTable');
    table.innerHTML = gatepassesData.map(p => `
      <tr class="hover:bg-slate-800/40">
        <td class="py-2.5 px-3 font-mono font-bold text-blue-400">${p.pass_id}</td>
        <td class="py-2.5 px-3">${p.student_name}</td>
        <td class="py-2.5 px-3">${p.pass_type}</td>
        <td class="py-2.5 px-3 font-mono text-[11px] text-slate-400">${p.valid_until}</td>
        <td class="py-2.5 px-3">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'APPROVED' ? 'bg-emerald-900/60 text-emerald-300' : p.status === 'CHECKED_OUT' ? 'bg-amber-900/60 text-amber-300' : 'bg-blue-900/60 text-blue-300'}">
            ${p.status}
          </span>
        </td>
      </tr>
    `).join('');

    lucide.createIcons();
  } catch (err) {
    console.error('Failed to load gate passes:', err);
  }
}

async function handleGatePassRequest(e) {
  e.preventDefault();
  const passType = document.getElementById('passTypeInput').value;
  const destination = document.getElementById('passDestinationInput').value;
  const reason = document.getElementById('passReasonInput').value;
  const hours = parseInt(document.getElementById('passHoursInput').value);

  try {
    const res = await fetch('/api/gatepasses/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: 'STU202401',
        pass_type: passType,
        destination: destination,
        reason: reason,
        valid_hours: hours
      })
    });
    const data = await res.json();
    showToast(data.message, 'success');
    closeModal('modalRequestPass');
    await loadGatePasses();
  } catch (err) {
    showToast('Failed to issue gate pass', 'error');
  }
}

async function handleSecurityScan(actionType) {
  const passId = document.getElementById('scanPassInput').value.trim();
  const feedback = document.getElementById('scanFeedbackBox');

  try {
    const res = await fetch('/api/gatepasses/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pass_id: passId,
        action_type: actionType,
        security_guard_notes: `Scanned at Main Gate by Inspector Vikram. Verification verified.`
      })
    });
    const data = await res.json();
    if (data.success) {
      feedback.innerHTML = `
        <div class="text-emerald-400 font-bold text-xs flex items-center space-x-2">
          <i data-lucide="check-circle" class="w-4 h-4"></i>
          <span>${data.message}</span>
        </div>
        <div class="text-[11px] text-slate-300 mt-1">Student: ${data.pass_details.student_name} | Pass: ${data.pass_details.pass_id}</div>
      `;
      showToast(data.message, 'success');
    } else {
      feedback.innerHTML = `
        <div class="text-red-400 font-bold text-xs flex items-center space-x-2">
          <i data-lucide="alert-triangle" class="w-4 h-4"></i>
          <span>${data.error}</span>
        </div>
      `;
      showToast(data.error, 'error');
    }
    await loadGatePasses();
    lucide.createIcons();
  } catch (err) {
    showToast('Gatepass scan failed', 'error');
  }
}

// ============================================================================
// 5. MESS RATINGS & 7-DAY MENU VOTING
// ============================================================================
let currentSelectedStars = 4;
function setStars(val) {
  currentSelectedStars = val;
  document.getElementById('selectedStarValue').value = val;
  const btns = document.querySelectorAll('.star-btn i');
  btns.forEach((icon, idx) => {
    if (idx < val) {
      icon.classList.remove('fill-slate-200');
      icon.classList.add('fill-amber-400');
    } else {
      icon.classList.remove('fill-amber-400');
      icon.classList.add('fill-slate-200');
    }
  });
}

async function loadMessData() {
  try {
    const pollRes = await fetch('/api/mess/menu-poll');
    const pollData = await pollRes.json();

    const container = document.getElementById('messPollContainer');
    container.innerHTML = Object.keys(pollData.days).map(day => {
      const dishes = pollData.days[day];
      const totalVotes = dishes.reduce((acc, d) => acc + d.vote_count, 0) || 1;

      return `
        <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div class="flex items-center justify-between text-xs font-bold text-slate-800">
            <span class="flex items-center space-x-1.5 text-blue-700">
              <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
              <span>${day} Menu Optimization (${dishes[0].meal_type})</span>
            </span>
            <span class="text-slate-500 font-medium">${totalVotes} student votes</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            ${dishes.map(d => {
              const pct = Math.round((d.vote_count / totalVotes) * 100);
              return `
                <div class="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span class="font-semibold text-xs text-slate-800 block">${d.dish_option}</span>
                    <div class="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                      <div class="bg-orange-500 h-full rounded-full transition-all duration-300" style="width: ${pct}%"></div>
                    </div>
                  </div>
                  <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                    <span class="font-bold text-slate-600">${d.vote_count} votes (${pct}%)</span>
                    <button onclick="castMenuVote(${d.id})" class="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-2.5 py-1 rounded text-[10px]">
                      Vote
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

    lucide.createIcons();
  } catch (err) {
    console.error('Failed to load mess data:', err);
  }
}

async function castMenuVote(dishId) {
  try {
    const res = await fetch('/api/mess/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: 'STU202401', dish_id: dishId })
    });
    const data = await res.json();
    showToast(data.message, 'success');
    await loadMessData();
  } catch (err) {
    showToast('Failed to cast vote', 'error');
  }
}

async function handleMessRatingSubmit(e) {
  e.preventDefault();
  const mealType = document.getElementById('messMealType').value;
  const stars = currentSelectedStars;
  const cleanStars = parseInt(document.getElementById('messCleanRating').value);
  const feedback = document.getElementById('messFeedbackText').value;

  try {
    const res = await fetch('/api/mess/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: 'STU202401',
        meal_type: mealType,
        stars: stars,
        cleanliness_stars: cleanStars,
        taste_feedback: feedback
      })
    });
    const data = await res.json();
    showToast(data.message, 'success');
    document.getElementById('messFeedbackText').value = '';
  } catch (err) {
    showToast('Failed to submit mess rating', 'error');
  }
}

// ============================================================================
// 6. SECURITY & CCTV THEFT DESK (24HR SLA)
// ============================================================================
async function loadCctvCases() {
  try {
    const res = await fetch('/api/security/cctv-cases');
    cctvCasesData = await res.json();

    const container = document.getElementById('cctvCasesList');
    if (cctvCasesData.length === 0) {
      container.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">No active theft or CCTV cases reported.</div>`;
      return;
    }

    container.innerHTML = cctvCasesData.map(c => `
      <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="font-mono text-xs font-bold text-red-600">${c.case_id}</span>
            <span class="text-xs font-semibold text-slate-700">Ref: ${c.ticket_id}</span>
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${c.footage_status === 'FOOTAGE_FOUND' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">
            ${c.footage_status}
          </span>
        </div>

        <h4 class="font-bold text-xs text-slate-900">${c.ticket_title}</h4>
        <p class="text-xs text-slate-600">${c.ticket_desc}</p>

        <div class="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
          <div class="text-slate-500 font-mono text-[11px]">ZONE: ${c.camera_zone}</div>
          <div class="text-slate-700 font-medium">Review Findings: ${c.review_summary || 'Analysis pending'}</div>
          ${c.reviewer_name ? `<div class="text-[11px] text-blue-700 font-semibold">Investigator: ${c.reviewer_name}</div>` : ''}
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
          <span class="text-red-600 font-bold flex items-center space-x-1">
            <i data-lucide="clock" class="w-3.5 h-3.5"></i>
            <span>24h Resolution SLA Active</span>
          </span>
          <button onclick="updateCctvFinding('${c.case_id}')" class="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-1.5 rounded-lg text-xs">
            Review Footage & Conclude Case
          </button>
        </div>
      </div>
    `).join('');

    lucide.createIcons();
  } catch (err) {
    console.error('Failed to load CCTV cases:', err);
  }
}

function switchCctvCam(zoneName) {
  document.getElementById('cctvZoneTag').innerText = zoneName;
  showToast(`Switched active live camera feed to: ${zoneName}`, 'info');
}

async function updateCctvFinding(caseId) {
  const findings = prompt("Enter Chief Security Review Summary (e.g. Suspect identified leaving via Gate 3 at 15:44, bike recovered):", "Suspect identified leaving via Gate 3 at 15:44. Security intercepted at checkpoint; bicycle recovered safely.");
  if (!findings) return;

  try {
    const res = await fetch('/api/security/cctv-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        case_id: caseId,
        footage_status: 'INVESTIGATION_COMPLETE',
        review_summary: findings,
        reviewer_name: 'Inspector Vikram Singh (Campus Security Command)',
        clip_filename: 'cctv_clip_zone_c_recovered.mp4'
      })
    });
    const data = await res.json();
    showToast(data.message, 'success');
    await loadCctvCases();
    await loadTickets();
  } catch (err) {
    showToast('Failed to update CCTV case', 'error');
  }
}

// ============================================================================
// 7. ACADEMIC HIGH-CONCURRENCY LOAD BENCHMARK
// ============================================================================
async function runBurstSimulation(requestsCount) {
  const box = document.getElementById('simResultBox');
  box.classList.remove('hidden');
  box.innerHTML = `<span class="text-blue-400">Firing ${requestsCount} simultaneous asynchronous requests against registration API...</span>`;

  try {
    const res = await fetch(`/api/academic/simulate-concurrency?requests_count=${requestsCount}`, {
      method: 'POST'
    });
    const data = await res.json();

    box.innerHTML = `
      <div class="text-emerald-400 font-bold mb-2 text-sm flex items-center space-x-2">
        <i data-lucide="check-circle-2" class="w-4 h-4"></i>
        <span>${data.verdict}</span>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-300">
        <div>Total Concurrent Requests: <b class="text-white">${data.burst_total_requests}</b></div>
        <div>Successful Responses: <b class="text-emerald-400">${data.successful_responses} (100%)</b></div>
        <div>Server Crashes / Dropped: <b class="text-emerald-400">${data.server_crashes}</b></div>
        <div>Throughput Rate: <b class="text-blue-400">${data.throughput_rps} Req/sec</b></div>
      </div>
      <div class="text-slate-400 mt-2 text-[11px]">
        Execution completed in ${data.elapsed_seconds} seconds. Database locks avoided via SQLite WAL mode and non-blocking worker pools.
      </div>
    `;
    document.getElementById('benchLatency').innerText = `${Math.round((data.elapsed_seconds / data.burst_total_requests) * 1000 * 10) / 10} ms`;
    lucide.createIcons();
  } catch (err) {
    box.innerHTML = `<span class="text-red-400">Simulation error: ${err.message}</span>`;
  }
}

// ============================================================================
// MODAL CONTROLS & UTILITIES
// ============================================================================
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function openNewTicketModal() {
  openModal('modalNewTicket');
}

function openRequestNoDuesModal() {
  showToast('Initiating Paperless Clearance Request...', 'info');
  fetch('/api/nodues/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_id: 'STU202401',
      degree: 'B.Tech Computer Science',
      department: 'Computer Science & Engineering',
      academic_year: '2024-2025'
    })
  }).then(r => r.json()).then(d => {
    showToast(d.message, 'success');
    loadNoDues();
  });
}

function openRequestGatePassModal() {
  openModal('modalRequestPass');
}

function openNewTheftModal() {
  document.getElementById('ticketCategory').value = 'security';
  updateSubcategories('security');
  document.getElementById('ticketTitle').value = 'Stolen Laptop / Bicycle (Urgent 24h SLA)';
  openModal('modalNewTicket');
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-slate-900';
  toast.className = `${bg} text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 transition duration-300 pointer-events-auto`;
  toast.innerHTML = `<span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
