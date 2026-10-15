/**
 * CHHOTE LAL PROPERTY DEALER - PROPERTY LISTINGS CONTROLLER
 * Supports real filtering by type, locality, price range, status, and sorting
 */

document.addEventListener('DOMContentLoaded', () => {
  initPropertyListingPage();
});

async function initPropertyListingPage() {
  const gridContainer = document.getElementById('property-listings-grid');
  const filterForm = document.getElementById('property-filter-form');
  const countBadge = document.getElementById('results-count-text');
  const clearBtn = document.getElementById('clear-filters-btn');

  if (!gridContainer) return;

  // Read URL query parameters to prepopulate filters (e.g., from hero search or type links)
  const urlParams = new URLSearchParams(window.location.search);
  const typeFilter = document.getElementById('filter-type');
  const localityFilter = document.getElementById('filter-locality');
  const minBudgetFilter = document.getElementById('filter-min-budget');
  const maxBudgetFilter = document.getElementById('filter-max-budget');
  const statusFilter = document.getElementById('filter-status');
  const sortSelect = document.getElementById('filter-sort');

  // Hardcoded page type override (e.g. for plots.html, houses.html, land.html)
  const pageCategory = gridContainer.getAttribute('data-category-override');

  if (pageCategory && typeFilter) {
    typeFilter.value = pageCategory;
    typeFilter.disabled = true; // Lock on dedicated category page
  } else if (urlParams.get('type') && typeFilter) {
    typeFilter.value = urlParams.get('type');
  }

  if (urlParams.get('locality') && localityFilter) {
    localityFilter.value = urlParams.get('locality');
  }
  if (urlParams.get('minBudget') && minBudgetFilter) {
    minBudgetFilter.value = urlParams.get('minBudget');
  }
  if (urlParams.get('maxBudget') && maxBudgetFilter) {
    maxBudgetFilter.value = urlParams.get('maxBudget');
  }
  if (urlParams.get('status') && statusFilter) {
    statusFilter.value = urlParams.get('status');
  }
  if (urlParams.get('sort') && sortSelect) {
    sortSelect.value = urlParams.get('sort');
  }

  // Load and apply initial filters
  await fetchAndRenderProperties();

  // Handle Form changes
  if (filterForm) {
    filterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await fetchAndRenderProperties();
    });

    // Real-time input debouncing
    const inputs = filterForm.querySelectorAll('select, input');
    inputs.forEach(input => {
      input.addEventListener('change', async () => {
        await fetchAndRenderProperties();
      });
    });

    if (localityFilter) {
      let timeout;
      localityFilter.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
          await fetchAndRenderProperties();
        }, 350);
      });
    }
  }

  // Clear filters
  if (clearBtn) {
    clearBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!pageCategory && typeFilter) typeFilter.value = 'all';
      if (localityFilter) localityFilter.value = '';
      if (minBudgetFilter) minBudgetFilter.value = '';
      if (maxBudgetFilter) maxBudgetFilter.value = '';
      if (statusFilter) statusFilter.value = 'all';
      if (sortSelect) sortSelect.value = 'latest';

      // Update URL without reloading
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);

      await fetchAndRenderProperties();
    });
  }

  async function fetchAndRenderProperties() {
    // Show loading skeleton state
    gridContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 0;">
        <div style="display:inline-block; width: 40px; height: 40px; border: 4px solid var(--border-grey); border-top-color: var(--gold-primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <p style="margin-top: 16px; color: var(--text-muted); font-size: 0.95rem;">प्रॉपर्टीज लोड हो रही हैं...</p>
      </div>
      <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
    `;

    try {
      const filters = {
        type: pageCategory || (typeFilter ? typeFilter.value : 'all'),
        locality: localityFilter ? localityFilter.value : '',
        minBudget: minBudgetFilter ? minBudgetFilter.value : '',
        maxBudget: maxBudgetFilter ? maxBudgetFilter.value : '',
        status: statusFilter ? statusFilter.value : 'all',
        sort: sortSelect ? sortSelect.value : 'latest'
      };

      const properties = await window.db.getProperties(filters);

      if (countBadge) {
        countBadge.textContent = `${properties.length} प्रॉपर्टीज उपलब्ध`;
      }

      if (properties.length === 0) {
        gridContainer.innerHTML = `
          <div class="empty-state-box" style="grid-column: 1 / -1;">
            <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            <h3 class="empty-state-title">कोई प्रॉपर्टी नहीं मिली (No Properties Found)</h3>
            <p class="empty-state-desc">फिलहाल आपके द्वारा चुने गए फ़िल्टर के अनुसार कोई प्रॉपर्टी लिस्ट नहीं है। अपनी विशिष्ट जरूरत बताने के लिए सीधे छोटे लाल जी से संपर्क करें।</p>
            <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
              <a href="tel:9664280667" class="btn btn-gold btn-md">कॉल करें: 9664280667</a>
              <a href="sell.html" class="btn btn-navy btn-md">अपनी प्रॉपर्टी लिस्ट करें</a>
            </div>
          </div>
        `;
        return;
      }

      gridContainer.innerHTML = properties.map(p => window.renderPropertyCardHTML(p)).join('');

    } catch (err) {
      console.error("Listing error:", err);
      gridContainer.innerHTML = `
        <div class="empty-state-box" style="grid-column: 1 / -1; border-color: #FECACA; background-color: #FEF2F2;">
          <h3 class="empty-state-title" style="color: #991B1B;">डेटा लोड करने में त्रुटि हुई</h3>
          <p class="empty-state-desc">कृपया अपने इंटरनेट कनेक्शन की जांच करें या पुनः प्रयास करें।</p>
          <button type="button" class="btn btn-navy" onclick="initPropertyListingPage()">पुनः प्रयास करें (Retry)</button>
        </div>
      `;
    }
  }
}
