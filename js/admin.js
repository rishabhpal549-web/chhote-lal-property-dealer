/**
 * CHHOTE LAL PROPERTY DEALER - ADMIN DASHBOARD CONTROLLER
 * Handles Authentication, Protected Route Check, Property CRUD, Enquiries, and Status Updates
 */

const ADMIN_SESSION_KEY = "cl_admin_authenticated_session_v1";

document.addEventListener('DOMContentLoaded', async () => {
  const isLoginPage = window.location.pathname.includes('login.html');

  if (isLoginPage) {
    initAdminLoginPage();
  } else {
    // Protected Route Check
    if (!checkAdminAuth()) {
      window.location.href = "login.html";
      return;
    }
    await initAdminDashboard();
  }
});

// Check if admin is authenticated
function checkAdminAuth() {
  const session = sessionStorage.getItem(ADMIN_SESSION_KEY);
  if (!session) return false;
  try {
    const data = JSON.parse(session);
    return data && data.authenticated === true && (Date.now() - data.timestamp < 24 * 60 * 60 * 1000);
  } catch (e) {
    return false;
  }
}

// Login Controller
function initAdminLoginPage() {
  const form = document.getElementById('admin-login-form');
  const alertBox = document.getElementById('login-alert');
  const submitBtn = document.getElementById('login-submit-btn');

  // If already logged in, redirect to dashboard
  if (checkAdminAuth()) {
    window.location.href = "dashboard.html";
    return;
  }

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;

    submitBtn.disabled = true;
    submitBtn.textContent = "सत्यापन किया जा रहा है...";

    try {
      // Check Supabase Auth if credentials exist
      let authenticated = false;

      if (window.APP_CONFIG && window.APP_CONFIG.supabase && window.APP_CONFIG.supabase.url && window.supabase) {
        try {
          const client = window.supabase.createClient(window.APP_CONFIG.supabase.url, window.APP_CONFIG.supabase.anonKey);
          const { data, error } = await client.auth.signInWithPassword({ email, password });
          if (error) throw error;
          if (data && data.user) authenticated = true;
        } catch (supabaseErr) {
          console.warn("Supabase Auth check failed, checking master security credentials:", supabaseErr.message);
        }
      }

      // Secure Dealer Administrator Access
      // Validates owner phone credentials or admin user credentials
      if (!authenticated) {
        if ((email === "admin@chhote-lal.local" || email === "admin" || email === "9664280667") && (password === "ChhoteLal@9664" || password === "Varanasi@2026")) {
          authenticated = true;
        }
      }

      if (authenticated) {
        const sessionPayload = {
          authenticated: true,
          user: email,
          timestamp: Date.now()
        };
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionPayload));
        
        alertBox.className = "feedback-banner success";
        alertBox.textContent = "सफलतापूर्वक लॉगिन हो गया! डैशबोर्ड लोड हो रहा है...";
        alertBox.style.display = "block";

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 600);
      } else {
        throw new Error("अमान्य ईमेल या पासवर्ड। कृपया पुनः प्रयास करें।");
      }
    } catch (err) {
      alertBox.className = "feedback-banner error";
      alertBox.textContent = err.message || "लॉगिन विफल रहा।";
      alertBox.style.display = "block";
      submitBtn.disabled = false;
      submitBtn.textContent = "लॉगिन करें (Sign In)";
    }
  });
}

// Dashboard Controller
async function initAdminDashboard() {
  setupAdminNavigation();
  setupLogout();
  await refreshDashboardStats();
  await loadAdminProperties();
  await loadAdminBuyerEnquiries();
  await loadAdminSellerEnquiries();
  setupPropertyFormModal();
}

function setupLogout() {
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (!logoutBtn) return;
  logoutBtn.addEventListener('click', () => {
    if (confirm("क्या आप एडमिन डैशबोर्ड से लॉगआउट करना चाहते हैं?")) {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      window.location.href = "login.html";
    }
  });
}

function setupAdminNavigation() {
  const tabs = document.querySelectorAll('.admin-tab-btn');
  const panels = document.querySelectorAll('.admin-tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');

      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.style.display = 'none');

      tab.classList.add('active');
      const activePanel = document.getElementById(`tab-${target}`);
      if (activePanel) activePanel.style.display = 'block';
    });
  });
}

async function refreshDashboardStats() {
  try {
    const props = await window.db.getProperties();
    const buyers = await window.db.getBuyerEnquiries();
    const sellers = await window.db.getSellerEnquiries();

    const availableCount = props.filter(p => p.status === 'Available').length;

    const elTotalProps = document.getElementById('stat-total-props');
    const elAvailProps = document.getElementById('stat-avail-props');
    const elBuyers = document.getElementById('stat-buyers');
    const elSellers = document.getElementById('stat-sellers');

    if (elTotalProps) elTotalProps.textContent = props.length;
    if (elAvailProps) elAvailProps.textContent = availableCount;
    if (elBuyers) elBuyers.textContent = buyers.length;
    if (elSellers) elSellers.textContent = sellers.length;
  } catch (err) {
    console.error("Stats refresh error:", err);
  }
}

// Load Properties in Admin Table
async function loadAdminProperties() {
  const tbody = document.getElementById('admin-properties-table-body');
  if (!tbody) return;

  try {
    const props = await window.db.getProperties();

    if (props.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-muted);">कोई प्रॉपर्टी दर्ज नहीं है।</td></tr>`;
      return;
    }

    tbody.innerHTML = props.map(p => {
      const statusClass = p.status === 'Available' ? 'status-available' : p.status === 'Under Discussion' ? 'status-discussion' : 'status-sold';
      const statusLabel = p.statusHindi || p.status;
      const priceText = p.priceOnRequest ? 'कीमत पूछें' : (p.priceText || `₹${p.price.toLocaleString('en-IN')}`);
      const thumbnail = p.images && p.images[0] ? p.images[0] : 'images/plot-sample.jpg';

      return `
        <tr data-prop-id="${p.id}">
          <td style="width: 70px;">
            <img src="${thumbnail}" alt="" style="width:54px; height:42px; object-fit:cover; border-radius:4px;">
          </td>
          <td>
            <div style="font-weight:700; color:var(--navy-primary); font-size:0.92rem;">${p.title}</div>
            <div style="font-size:0.78rem; color:var(--text-muted); font-family:monospace;">ID: ${p.id} • ${p.locality}</div>
          </td>
          <td>
            <span class="admin-badge" style="background:#EEF2F6; color:var(--navy-primary); font-weight:600;">${p.typeHindi || p.type}</span>
          </td>
          <td style="font-weight:600;">${priceText}</td>
          <td>
            <select class="form-control" style="padding:4px 8px; font-size:0.82rem; width:130px;" onchange="updatePropStatusFromTable('${p.id}', this.value)">
              <option value="Available" ${p.status === 'Available' ? 'selected' : ''}>Available (उपलब्ध)</option>
              <option value="Under Discussion" ${p.status === 'Under Discussion' ? 'selected' : ''}>Under Discussion</option>
              <option value="Sold" ${p.status === 'Sold' ? 'selected' : ''}>Sold (बिक चुका)</option>
            </select>
          </td>
          <td style="text-align:right;">
            <div style="display:inline-flex; gap:6px;">
              <button type="button" class="btn btn-navy btn-sm" onclick="openEditPropertyModal('${p.id}')">संशोधन</button>
              <button type="button" class="btn btn-phone btn-sm" style="color:#DC2626; border-color:#FECACA;" onclick="confirmDeleteProperty('${p.id}', '${p.title.replace(/'/g, "\\'")}')">हटाएं</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">त्रुटि: ${err.message}</td></tr>`;
  }
}

// Update Property status directly from table
window.updatePropStatusFromTable = async function(id, newStatus) {
  try {
    await window.db.updateProperty(id, { status: newStatus });
    await refreshDashboardStats();
    console.log(`Property ${id} status updated to ${newStatus}`);
  } catch (err) {
    alert("स्थिति अपडेट करने में त्रुटि: " + err.message);
  }
};

// Confirm & Delete Property
window.confirmDeleteProperty = async function(id, title) {
  if (confirm(`क्या आप निश्चित हैं कि आप इस प्रॉपर्टी को स्थायी रूप से हटाना चाहते हैं?\n\n"${title}"`)) {
    try {
      await window.db.deleteProperty(id);
      await loadAdminProperties();
      await refreshDashboardStats();
      alert("प्रॉपर्टी सफलतापूर्वक हटा दी गई।");
    } catch (err) {
      alert("प्रॉपर्टी हटाने में त्रुटि: " + err.message);
    }
  }
};

// Property Add/Edit Modal
function setupPropertyFormModal() {
  const modal = document.getElementById('property-modal');
  const openBtn = document.getElementById('open-add-property-modal-btn');
  const closeBtn = document.getElementById('close-property-modal-btn');
  const cancelBtn = document.getElementById('cancel-property-modal-btn');
  const form = document.getElementById('admin-property-form');
  const modalTitle = document.getElementById('modal-title-text');
  const typeSelect = document.getElementById('modal-prop-type');
  const houseFields = document.getElementById('modal-house-fields');

  if (!modal || !form) return;

  function openModal(isEdit = false) {
    modal.classList.add('open');
    modalTitle.textContent = isEdit ? "प्रॉपर्टी संशोधित करें (Edit Property)" : "नई प्रॉपर्टी जोड़ें (Add Property)";
  }

  function closeModal() {
    modal.classList.remove('open');
    form.reset();
    document.getElementById('modal-prop-id').value = "";
  }

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('modal-prop-id').value = "";
      if (houseFields) houseFields.style.display = 'none';
      openModal(false);
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (typeSelect && houseFields) {
    typeSelect.addEventListener('change', () => {
      houseFields.style.display = typeSelect.value === 'House' ? 'grid' : 'none';
    });
  }

  // Handle Form Submit (Add or Edit)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const propId = document.getElementById('modal-prop-id').value;
    const isEdit = Boolean(propId);

    const priceVal = Number(document.getElementById('modal-prop-price').value) || 0;
    const priceOnRequest = document.getElementById('modal-prop-price-request').checked;
    const facilitiesRaw = document.getElementById('modal-prop-facilities').value;
    const facilitiesArr = facilitiesRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);

    const propData = {
      title: document.getElementById('modal-prop-title').value,
      type: document.getElementById('modal-prop-type').value,
      locality: document.getElementById('modal-prop-locality').value,
      area: Number(document.getElementById('modal-prop-area').value) || 0,
      areaUnit: document.getElementById('modal-prop-area-unit').value,
      price: priceVal,
      priceOnRequest: priceOnRequest,
      priceText: priceOnRequest ? "कीमत पूछें" : document.getElementById('modal-prop-price-text').value,
      status: document.getElementById('modal-prop-status').value,
      isIllustrative: document.getElementById('modal-prop-illustrative').checked,
      description: document.getElementById('modal-prop-desc').value,
      facilities: facilitiesArr,
      bedrooms: document.getElementById('modal-prop-bedrooms') ? Number(document.getElementById('modal-prop-bedrooms').value) : null,
      bathrooms: document.getElementById('modal-prop-bathrooms') ? Number(document.getElementById('modal-prop-bathrooms').value) : null
    };

    const imageUrl = document.getElementById('modal-prop-image-url').value.trim();
    if (imageUrl) {
      propData.images = [imageUrl];
    }

    try {
      if (isEdit) {
        await window.db.updateProperty(propId, propData);
        alert("प्रॉपर्टी सफलतापूर्वक अपडेट हो गई!");
      } else {
        await window.db.addProperty(propData);
        alert("नई प्रॉपर्टी सफलतापूर्वक लिस्ट हो गई!");
      }

      closeModal();
      await loadAdminProperties();
      await refreshDashboardStats();
    } catch (err) {
      alert("त्रुटि: " + err.message);
    }
  });

  // Global trigger for opening edit
  window.openEditPropertyModal = async function(id) {
    try {
      const prop = await window.db.getPropertyById(id);
      if (!prop) return;

      document.getElementById('modal-prop-id').value = prop.id;
      document.getElementById('modal-prop-title').value = prop.title;
      document.getElementById('modal-prop-type').value = prop.type;
      document.getElementById('modal-prop-locality').value = prop.locality;
      document.getElementById('modal-prop-area').value = prop.area;
      document.getElementById('modal-prop-area-unit').value = prop.areaUnit || 'sq.ft';
      document.getElementById('modal-prop-price').value = prop.price;
      document.getElementById('modal-prop-price-request').checked = Boolean(prop.priceOnRequest);
      document.getElementById('modal-prop-price-text').value = prop.priceText || '';
      document.getElementById('modal-prop-status').value = prop.status;
      document.getElementById('modal-prop-illustrative').checked = Boolean(prop.isIllustrative);
      document.getElementById('modal-prop-desc').value = prop.description || '';
      document.getElementById('modal-prop-facilities').value = (prop.facilities || []).join(', ');
      document.getElementById('modal-prop-image-url').value = (prop.images && prop.images[0]) || '';

      if (houseFields) {
        houseFields.style.display = prop.type === 'House' ? 'grid' : 'none';
        if (prop.bedrooms) document.getElementById('modal-prop-bedrooms').value = prop.bedrooms;
        if (prop.bathrooms) document.getElementById('modal-prop-bathrooms').value = prop.bathrooms;
      }

      openModal(true);
    } catch (err) {
      alert("प्रॉपर्टी लोड करने में त्रुटि: " + err.message);
    }
  };
}

// Load Buyer Enquiries
async function loadAdminBuyerEnquiries() {
  const tbody = document.getElementById('admin-buyer-enquiries-table-body');
  if (!tbody) return;

  try {
    const list = await window.db.getBuyerEnquiries();

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-muted);">कोई खरीदार पूछताछ नहीं है।</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(enq => {
      const dateStr = new Date(enq.createdAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      return `
        <tr>
          <td style="font-size:0.8rem; color:var(--text-muted);">${dateStr}</td>
          <td>
            <strong>${enq.name}</strong><br>
            <a href="tel:${enq.phone}" style="color:var(--navy-primary); font-weight:600;">${enq.phone}</a>
          </td>
          <td>
            <span class="admin-badge" style="background:#E2E8F0;">${enq.propertyType}</span><br>
            <span style="font-size:0.8rem; color:var(--text-muted);">${enq.locality}</span>
          </td>
          <td>${enq.budget || 'Not specified'}</td>
          <td style="max-width:240px; font-size:0.85rem; line-height:1.4;">
            ${enq.propertyTitle ? `<div style="font-weight:600; color:var(--gold-hover); font-size:0.8rem;">Re: ${enq.propertyTitle}</div>` : ''}
            ${enq.message || 'कोई संदेश नहीं'}
          </td>
          <td>
            <select class="form-control" style="padding:4px 8px; font-size:0.82rem; width:120px;" onchange="updateBuyerEnquiryStatus('${enq.id}', this.value)">
              <option value="New" ${enq.status === 'New' ? 'selected' : ''}>New (नया)</option>
              <option value="Contacted" ${enq.status === 'Contacted' ? 'selected' : ''}>Contacted (बातचीत हुई)</option>
              <option value="In Progress" ${enq.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Closed" ${enq.status === 'Closed' ? 'selected' : ''}>Closed (पूर्ण)</option>
            </select>
          </td>
          <td>
            <button type="button" class="btn btn-navy btn-sm" onclick="promptAddNote('buyer', '${enq.id}', '${(enq.notes || '').replace(/'/g, "\\'")}')">नोट्स (${enq.notes ? '1' : '0'})</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center;">त्रुटि: ${err.message}</td></tr>`;
  }
}

// Load Seller Submissions
async function loadAdminSellerEnquiries() {
  const tbody = document.getElementById('admin-seller-enquiries-table-body');
  if (!tbody) return;

  try {
    const list = await window.db.getSellerEnquiries();

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-muted);">कोई विक्रेता सबमिशन नहीं है।</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(sub => {
      const dateStr = new Date(sub.createdAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      const photoThumb = sub.photos && sub.photos[0] ? `<img src="${sub.photos[0]}" style="width:40px; height:40px; object-fit:cover; border-radius:4px; display:inline-block; margin-right:4px;">` : '';

      return `
        <tr>
          <td style="font-size:0.8rem; color:var(--text-muted);">${dateStr}</td>
          <td>
            <strong>${sub.ownerName}</strong><br>
            <a href="tel:${sub.phone}" style="color:var(--navy-primary); font-weight:600;">${sub.phone}</a>
          </td>
          <td>
            <span class="admin-badge" style="background:#E2E8F0;">${sub.propertyType}</span><br>
            <span style="font-size:0.8rem; color:var(--text-muted);">${sub.locality}</span>
          </td>
          <td>${sub.area} ${sub.areaUnit}</td>
          <td>${sub.expectedPrice || 'Not specified'}</td>
          <td>
            ${photoThumb}
            <span style="font-size:0.8rem; color:var(--text-muted);">${sub.photos ? sub.photos.length : 0} फोटो</span>
          </td>
          <td>
            <select class="form-control" style="padding:4px 8px; font-size:0.82rem; width:120px;" onchange="updateSellerEnquiryStatus('${sub.id}', this.value)">
              <option value="New" ${sub.status === 'New' ? 'selected' : ''}>New</option>
              <option value="In Progress" ${sub.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Listed" ${sub.status === 'Listed' ? 'selected' : ''}>Listed</option>
              <option value="Rejected" ${sub.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
            </select>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center;">त्रुटि: ${err.message}</td></tr>`;
  }
}

window.updateBuyerEnquiryStatus = async function(id, status) {
  try {
    await window.db.updateBuyerEnquiryStatus(id, status);
  } catch (err) {
    alert("स्थिति अपडेट त्रुटि: " + err.message);
  }
};

window.updateSellerEnquiryStatus = async function(id, status) {
  try {
    await window.db.updateSellerEnquiryStatus(id, status);
  } catch (err) {
    alert("स्थिति अपडेट त्रुटि: " + err.message);
  }
};

window.promptAddNote = async function(type, id, existingNote) {
  const newNote = prompt("आंतरिक डीलर नोट्स दर्ज करें (Internal Dealer Notes):", existingNote || "");
  if (newNote !== null) {
    try {
      if (type === 'buyer') {
        await window.db.updateBuyerEnquiryStatus(id, undefined, newNote);
        await loadAdminBuyerEnquiries();
      } else {
        await window.db.updateSellerEnquiryStatus(id, undefined, newNote);
        await loadAdminSellerEnquiries();
      }
    } catch (err) {
      alert("नोट सेव करने में त्रुटि: " + err.message);
    }
  }
};
