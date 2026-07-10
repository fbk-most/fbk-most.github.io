// ─── Config ───────────────────────────────────────────────────────────────────

// Optional social/link fields a person can have. Only non-empty ones are
// written to people.json, so the shape of each entry matches the source data
// (some people have a "linkedin", others "github" + "scholar", etc.).
const SOCIAL_FIELDS = ['website', 'linkedin', 'github', 'scholar', 'research_gate', 'twitter'];

// ─── State ────────────────────────────────────────────────────────────────────

let peopleData = { current: [], visitor: [], alumni: [] };
let currentEditCategory = 'current';
let currentPeopleEditIndex = -1;

// ─── Image upload ─────────────────────────────────────────────────────────────

// A few common letters don't decompose into base+accent via NFD (e.g. Polish
// "Ł" or Danish "Ø" are their own codepoints), so they'd otherwise be dropped
// entirely instead of degrading to a sensible ASCII letter.
const NON_DECOMPOSING_TRANSLIT = {
  'ł': 'l', 'Ł': 'L',
  'đ': 'd', 'Đ': 'D',
  'ø': 'o', 'Ø': 'O',
  'ß': 'ss',
  'æ': 'ae', 'Æ': 'AE',
  'œ': 'oe', 'Œ': 'OE',
};

// Turns "Jäne  O'Brien" into "jane-obrien": strips accents, lowercases,
// replaces anything that isn't a-z/0-9 with a hyphen, and collapses repeats.
function normalizeImageFilename(name, surname) {
  const combined = `${name || ''}-${surname || ''}`
    .split('')
    .map(char => NON_DECOMPOSING_TRANSLIT[char] || char)
    .join('');

  const raw = combined
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // strip remaining accents/diacritics

  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// If `imageValue` is a freshly-uploaded data: URI, uploads it to the server
// under a name-surname-based filename and returns the resulting static path.
// If it's already a path (unchanged existing image), returns it unchanged.
async function persistPersonImage(imageValue, name, surname) {
  if (!imageValue || !imageValue.startsWith('data:')) {
    return imageValue || '';
  }

  const filename = normalizeImageFilename(name, surname);
  if (!filename) {
    throw new Error('Cannot save image: name and surname are required first.');
  }

  const response = await fetch('/api/upload-people-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, data: imageValue }),
  });

  const result = await response.json();
  if (!response.ok || result.error) {
    throw new Error(result.error || 'Image upload failed.');
  }

  return result.path;
}

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
  initToolbar('editorToolbar', 'edit-bio-editor');
  initToolbar('createGenEditorToolbar', 'create-gen-description-editor');

  // Explicitly initialize the custom flag before togglePeopleFields runs
  const createImageHidden = document.getElementById('create-image');
  if (createImageHidden) createImageHidden.dataset.custom = 'false';

  loadPeopleData();

  const createImageFile = document.getElementById('createImageFile');
  if (createImageFile) createImageFile.addEventListener('change', handlePeopleCreateImageFileChange);

  const editImageFile = document.getElementById('editImageFile');
  if (editImageFile) editImageFile.addEventListener('change', handleEditImageFileChange);

  if (document.getElementById('peopleForm')) togglePeopleFields();
});

// ─── People data loading ──────────────────────────────────────────────────────

async function loadPeopleData() {
  try {
    const response = await fetch(`/static/data/people.json?t=${Date.now()}`);
    const data = await response.json();
    peopleData = {
      current: data.current || [],
      visitor: data.visitor || [],
      alumni:  data.alumni  || [],
    };
    populatePersonSelect();
  } catch (error) {
    console.error('Error loading people data:', error);
  }
}

function personLabel(person) {
  const name = `${person.name || ''} ${person.surname || ''}`.trim();
  return name || '(unnamed)';
}

function onCategoryChange() {
  currentEditCategory = document.getElementById('category-select').value;
  populatePersonSelect();

  const editForm = document.getElementById('editForm');
  if (editForm) editForm.classList.add('hidden');
  currentPeopleEditIndex = -1;
}

function populatePersonSelect() {
  const categorySelect = document.getElementById('category-select');
  const select = document.getElementById('person-select');
  if (!select) return;

  const category = categorySelect ? categorySelect.value : currentEditCategory;
  const list = peopleData[category] || [];

  select.innerHTML = '<option value="">Choose a person...</option>';
  list.forEach((person, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = personLabel(person);
    select.appendChild(option);
  });
}

// ─── Edit tab ─────────────────────────────────────────────────────────────────

function loadPersonForEdit() {
  const categorySelect = document.getElementById('category-select');
  const category = categorySelect ? categorySelect.value : 'current';
  const select   = document.getElementById('person-select');
  const index    = parseInt(select.value);

  const list = peopleData[category] || [];

  if (isNaN(index) || index < 0 || index >= list.length) {
    document.getElementById('editForm').classList.add('hidden');
    return;
  }

  currentEditCategory = category;
  currentPeopleEditIndex = index;
  const person = list[index];

  document.getElementById('edit-name').value          = person.name     || '';
  document.getElementById('edit-surname').value        = person.surname  || '';
  document.getElementById('edit-position').value       = person.position || '';
  document.getElementById('edit-order').value           = person.order    ?? '';
  document.getElementById('edit-category').value       = category;               // sync the edit-category dropdown
  document.getElementById('edit-bio-editor').innerHTML = person.bio      || '';

  SOCIAL_FIELDS.forEach(field => {
    const input = document.getElementById(`edit-${field}`);
    if (input) input.value = person[field] || '';
  });

  setEditImagePreview(person.image || '');
  document.getElementById('editForm').classList.remove('hidden');
}

function setEditImagePreview(src) {
    setImagePreview(
        'editImagePreviewImg',
        'editImagePlaceholder',
        'edit-image',
        src
    );
}

function handleEditImageFileChange(e) {
    previewUploadedImage(e, setEditImagePreview);
}

function buildPersonFromForm(prefix, category) {
  const orderEl = prefix === 'edit'
    ? document.getElementById('edit-order')
    : document.getElementById('order');

  const person = {
    name:     document.getElementById(`${prefix}-name`).value,
    surname:  document.getElementById(`${prefix}-surname`).value,
    position: document.getElementById(`${prefix}-position`).value,
    image:    document.getElementById(`${prefix}-image`).value,
  };

  SOCIAL_FIELDS.forEach(field => {
    const input = document.getElementById(`${prefix}-${field}`);
    const value = input ? input.value.trim() : '';
    if (value) person[field] = value;
  });

  const orderValue = orderEl ? orderEl.value : '';
  person.order = orderValue !== '' ? orderValue : '';

  return person;
}

async function savePerson() {
  syncEditor('edit-bio-editor', 'edit-bio');
  if (currentPeopleEditIndex < 0) return;

  const newCategory = document.getElementById('edit-category').value;  // Fix 3
  const person = buildPersonFromForm('edit', newCategory);
  person.bio = document.getElementById('edit-bio').value;

  if (!person.name || !person.surname || !person.position || !person.bio || !person.image) {
    alert('Name, surname, position, bio and image are required.');
    return;
  }

  try {
    person.image = await persistPersonImage(person.image, person.name, person.surname);
  } catch (error) {
    console.error('Error uploading image:', error);
    alert(error.message || 'Error uploading image.');
    return;
  }

  if (newCategory !== currentEditCategory) {
    peopleData[currentEditCategory].splice(currentPeopleEditIndex, 1);
    peopleData[newCategory].push(person);
  } else {
    peopleData[currentEditCategory][currentPeopleEditIndex] = person;
  }

  try {
    const response = await fetch('/api/update-people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(peopleData),
    });
    if (response.ok) {
      alert('Person updated successfully!');
      currentEditCategory = newCategory;  // Fix 3: keep state in sync

      const categorySelect = document.getElementById('category-select');
      if (categorySelect) categorySelect.value = newCategory;

      await loadPeopleData();
      populatePersonSelect();
      document.getElementById('editForm').classList.add('hidden');
      document.getElementById('person-select').value = '';
    } else {
      alert('Error updating person.');
    }
  } catch (error) {
    console.error('Error saving person:', error);
    alert('Error saving person.');
  }
}

async function deletePerson() {
  if (currentPeopleEditIndex < 0) return;
  if (!confirm('Are you sure you want to delete this person?')) return;

  peopleData[currentEditCategory].splice(currentPeopleEditIndex, 1);

  try {
    const response = await fetch('/api/update-people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(peopleData),
    });
    if (response.ok) {
      alert('Person deleted successfully!');
      currentPeopleEditIndex = -1;
      document.getElementById('editForm').classList.add('hidden');
      document.getElementById('person-select').value = '';
      await loadPeopleData();
      populatePersonSelect();
    } else {
      alert('Error deleting person.');
    }
  } catch (error) {
    console.error('Error deleting person:', error);
    alert('Error deleting person.');
  }
}

// ─── Create tab ───────────────────────────────────────────────────────────────

function togglePeopleFields() {
  updatePeopleDefaultImagePreview();
}

function updatePeopleDefaultImagePreview() {
  const hidden = document.getElementById('create-image');
  if (!hidden || hidden.dataset.custom === 'true') return;

  const img = document.getElementById('createImagePreviewImg');
}

function handlePeopleCreateImageFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img    = document.getElementById('createImagePreviewImg');
    const hidden = document.getElementById('create-image');

    img.src               = reader.result;
    img.style.display     = 'block';
    hidden.value          = reader.result;
    hidden.dataset.custom = 'true';
    const clearBtn = document.getElementById('clearImageBtn');
    if (clearBtn) clearBtn.style.display = '';
  };
  reader.readAsDataURL(file);
}

async function submitPerson() {
  syncEditor('create-gen-description-editor', 'create-gen-description');

  const category = document.getElementById('create-category').value;
  const person   = buildPersonFromForm('create', category);
  person.bio     = document.getElementById('create-gen-description').value;

  if (!person.name || !person.surname || !person.position || !person.bio || !person.image) {
    alert('Name, surname, position, bio and image are required.');
    return;
  }

  try {
    person.image = await persistPersonImage(person.image, person.name, person.surname);
  } catch (error) {
    console.error('Error uploading image:', error);
    alert(error.message || 'Error uploading image.');
    return;
  }

  const updatedPeopleData = {
    current: [...peopleData.current],
    visitor: [...peopleData.visitor],
    alumni:  [...peopleData.alumni],
  };
  updatedPeopleData[category].push(person);

  try {
    const response = await fetch('/api/update-people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPeopleData),
    });

    if (response.ok) {
      alert('Person published successfully!');
      // Reload people data and reset the form
      await loadPeopleData();
      document.getElementById('peopleForm').reset();
      document.getElementById('create-gen-description-editor').innerHTML = '';
      document.getElementById('create-image').dataset.custom = 'false';
      const clearBtn = document.getElementById('clearImageBtn');
      if (clearBtn) clearBtn.style.display = 'none';
      togglePeopleFields(); // resets image preview
    } else {
      alert('Error publishing person.');
    }
  } catch (error) {
    console.error('Error submitting person:', error);
    alert('Error publishing person.');
  }
}