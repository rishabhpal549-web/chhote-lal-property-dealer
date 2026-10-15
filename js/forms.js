/**
 * CHHOTE LAL PROPERTY DEALER - FORMS & SUBMISSION CONTROLLER
 * Handles Sell Property submissions, image previews/validation, buyer enquiries, and anti-abuse protection
 */

document.addEventListener('DOMContentLoaded', () => {
  initSellForm();
  initContactEnquiryForm();
});

// Stored photos for the current sell submission
let selectedSellPhotos = [];

function initSellForm() {
  const form = document.getElementById('sell-property-form');
  const fileInput = document.getElementById('sell-photos-input');
  const dropzone = document.getElementById('sell-file-dropzone');
  const previewGrid = document.getElementById('sell-photos-preview');
  const banner = document.getElementById('sell-form-banner');
  const submitBtn = document.getElementById('sell-submit-btn');

  if (!form) return;

  // File Dropzone & selection
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    ['dragleave', 'dragend'].forEach(evt => {
      dropzone.addEventListener(evt, () => dropzone.classList.remove('dragover'));
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelection(e.dataTransfer.files);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelection(e.target.files);
      }
    });
  }

  function handleFileSelection(files) {
    const maxFiles = 5;
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    for (let i = 0; i < files.length; i++) {
      if (selectedSellPhotos.length >= maxFiles) {
        alert("अधिकतम 5 फोटो अपलोड की जा सकती हैं।");
        break;
      }

      const file = files[i];

      if (!allowedTypes.includes(file.type)) {
        alert(`अमान्य फ़ाइल प्रकार (${file.name})। केवल JPG, PNG, या WebP छवियां स्वीकार्य हैं।`);
        continue;
      }

      if (file.size > maxSizeBytes) {
        alert(`फ़ाइल "${file.name}" का आकार 5MB से अधिक है। कृपया छोटी फ़ाइल चुनें।`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        selectedSellPhotos.push(e.target.result);
        renderPhotoPreviews();
      };
      reader.readAsDataURL(file);
    }
  }

  function renderPhotoPreviews() {
    if (!previewGrid) return;
    previewGrid.innerHTML = selectedSellPhotos.map((dataUrl, idx) => `
      <div class="file-preview-item">
        <img src="${dataUrl}" alt="Preview ${idx + 1}">
        <button type="button" class="file-remove-btn" onclick="removeSelectedPhoto(${idx})" title="हटाएं">&times;</button>
      </div>
    `).join('');
  }

  window.removeSelectedPhoto = function(idx) {
    selectedSellPhotos.splice(idx, 1);
    renderPhotoPreviews();
  };

  // Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Anti-abuse Honeypot check
    const honeypot = form.querySelector('[name="hp_extra_field"]');
    if (honeypot && honeypot.value !== '') {
      console.warn("Spam detected.");
      return;
    }

    const formData = new FormData(form);
    const data = {
      ownerName: formData.get('ownerName'),
      phone: formData.get('phone'),
      propertyType: formData.get('propertyType'),
      locality: formData.get('locality'),
      area: formData.get('area'),
      areaUnit: formData.get('areaUnit'),
      expectedPrice: formData.get('expectedPrice'),
      description: formData.get('description'),
      photos: [...selectedSellPhotos],
      consent: formData.get('consent') === 'on'
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span style="display:inline-block; width:16px; height:16px; border:2px solid #FFF; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite; margin-right:8px;"></span>
      सबमिट हो रहा है...
    `;

    try {
      const saved = await window.db.addSellerEnquiry(data);
      
      banner.className = "feedback-banner success";
      banner.innerHTML = `
        <h4 style="font-size: 1.1rem; margin-bottom: 6px;">आपकी प्रॉपर्टी की जानकारी सफलतापूर्वक सुरक्षित रूप से दर्ज कर ली गई है!</h4>
        <p>संदर्भ संख्या (Reference ID): <strong>${saved.id}</strong></p>
        <p style="margin-top: 4px;">छोटे लाल जी द्वारा दिए गए नंबर <strong>${saved.phone}</strong> पर शीघ्र संपर्क किया जाएगा।</p>
      `;
      banner.scrollIntoView({ behavior: 'smooth', block: 'center' });

      form.reset();
      selectedSellPhotos = [];
      renderPhotoPreviews();

    } catch (err) {
      banner.className = "feedback-banner error";
      banner.innerHTML = `<strong>त्रुटि:</strong> ${err.message || 'सबमिशन में समस्या आई। कृपया पुनः प्रयास करें।'}`;
      banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>प्रॉपर्टी की जानकारी सबमिट करें (Submit Details)</span>`;
    }
  });
}

function initContactEnquiryForm() {
  const form = document.getElementById('general-contact-form');
  const banner = document.getElementById('contact-form-banner');
  const submitBtn = document.getElementById('contact-submit-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Anti-abuse Honeypot check
    const honeypot = form.querySelector('[name="website_url_check"]');
    if (honeypot && honeypot.value !== '') {
      return;
    }

    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      propertyType: formData.get('propertyType'),
      locality: formData.get('locality'),
      budget: formData.get('budget'),
      message: formData.get('message'),
      consent: formData.get('consent') === 'on'
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "संदेश भेजा जा रहा है...";

    try {
      const saved = await window.db.addBuyerEnquiry(data);
      banner.className = "feedback-banner success";
      banner.innerHTML = `<strong>धन्यवाद ${saved.name}!</strong> आपका संदेश सफलतापूर्वक प्राप्त हो गया है (Ref ID: ${saved.id})। छोटे लाल जी आपसे <strong>${saved.phone}</strong> पर जल्द संपर्क करेंगे।`;
      form.reset();
    } catch (err) {
      banner.className = "feedback-banner error";
      banner.innerHTML = `त्रुटि: ${err.message || 'पूछताछ दर्ज करने में समस्या आई।'}`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "संदेश भेजें (Send Message)";
    }
  });
}
