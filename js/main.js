/**
 * CHHOTE LAL PROPERTY DEALER - GLOBAL SCRIPTS & UI INTERACTIONS
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileDrawer();
  initFaqAccordion();
  highlightActiveNav();
  initHeaderScroll();
});

// Mobile Drawer Navigation
function initMobileDrawer() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.drawer-overlay');
  const closeBtn = document.querySelector('.drawer-close');

  if (!toggleBtn || !drawer || !overlay) return;

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

// Header elevation on scroll
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.style.boxShadow = '0 6px 20px rgba(10, 23, 38, 0.25)';
    } else {
      header.style.boxShadow = '0 4px 16px rgba(10, 23, 38, 0.15)';
    }
  }, { passive: true });
}

// FAQ Accordion
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      
      // Close others
      faqItems.forEach(other => {
        if (other !== item) other.classList.remove('active');
      });

      // Toggle current
      item.classList.toggle('active', !isOpen);
    });
  });
}

// Active Nav Link
function highlightActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .drawer-nav a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPath = href.split('/').pop();

    if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Shared HTML Generator for a Property Card
 * @param {Object} prop - Property entity
 * @returns {string} - HTML string
 */
function renderPropertyCardHTML(prop) {
  const statusClass = prop.status === 'Available' 
    ? 'status-available' 
    : prop.status === 'Under Discussion' 
      ? 'status-discussion' 
      : 'status-sold';

  const statusLabel = prop.statusHindi || (prop.status === 'Available' ? 'उपलब्ध' : prop.status === 'Under Discussion' ? 'बातचीत जारी' : 'बिक चुका है');
  
  const priceDisplay = prop.priceOnRequest 
    ? `<span style="font-size:1.1rem; color:var(--gold-hover);">कीमत पूछें</span> <span class="price-unit">(Price on Request)</span>` 
    : `₹${prop.priceText || prop.price.toLocaleString('en-IN')} <span class="price-unit">लाख/अनुमानित</span>`;

  const imageSrc = prop.images && prop.images[0] ? prop.images[0] : 'images/plot-sample.jpg';
  const whatsappUrl = window.getPropertyWhatsAppLink ? window.getPropertyWhatsAppLink(prop) : `https://wa.me/919664280667`;

  // Bedrooms & Bathrooms specs row if provided
  let specsHTML = `
    <div class="spec-item">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 7v14M21 7v14M6 11h12M6 15h12M9 7V3h6v4"/></svg>
      <span>क्षेत्र: ${prop.area} ${prop.areaUnit || 'sq.ft'}</span>
    </div>
    <div class="spec-item">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
      <span>श्रेणी: ${prop.typeHindi || prop.type}</span>
    </div>
  `;

  if (prop.type === 'House' && prop.bedrooms) {
    specsHTML = `
      <div class="spec-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>कमरे: ${prop.bedrooms} BHK (${prop.bathrooms || 1} Bath)</span>
      </div>
      <div class="spec-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 7v14M21 7v14M6 11h12M6 15h12M9 7V3h6v4"/></svg>
        <span>क्षेत्र: ${prop.area} ${prop.areaUnit || 'sq.ft'}</span>
      </div>
    `;
  }

  const illustrativeBadge = prop.isIllustrative 
    ? `<span class="illustrative-tag">सांकेतिक चित्र (Design Preview)</span>` 
    : '';

  return `
    <div class="property-card" data-id="${prop.id}">
      <div class="property-card-media">
        <img src="${imageSrc}" alt="${prop.title}" loading="lazy">
        <span class="property-badge-type">${prop.typeHindi || prop.type}</span>
        <span class="property-badge-status ${statusClass}">${statusLabel}</span>
        ${illustrativeBadge}
      </div>
      <div class="property-card-body">
        <div class="property-price">${priceDisplay}</div>
        <h3 class="property-title">${prop.title}</h3>
        <div class="property-location">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>${prop.locality}</span>
        </div>
        <div class="property-meta-specs">
          ${specsHTML}
        </div>
        <div class="property-card-actions">
          <a href="property-details.html?id=${prop.id}" class="btn btn-navy btn-sm">विवरण देखें</a>
          <a href="tel:9664280667" class="btn btn-phone btn-sm" title="कॉल करें" aria-label="कॉल करें">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            कॉल
          </a>
          <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm" title="WhatsApp Enquiry" aria-label="WhatsApp Enquiry">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  `;
}

window.renderPropertyCardHTML = renderPropertyCardHTML;
