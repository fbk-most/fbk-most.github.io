// ─── Config ───────────────────────────────────────────────────────────────────

// Optional social/link fields a person can have. Only non-empty ones are
// written to people.json, so the shape of each entry matches the source data
// (some people have a "linkedin", others "github" + "scholar", etc.).
const SOCIAL_FIELDS = ['website', 'linkedin', 'github', 'scholar', 'research_gate', 'twitter'];

// ─── State ────────────────────────────────────────────────────────────────────

let peopleData = { current: [], visitor: [], alumni: [] };
let currentEditCategory = 'current';
let currentPeopleEditIndex = -1;

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

  if (document.getElementById('newsForm')) togglePeopleFields();
});

// ─── People data loading ──────────────────────────────────────────────────────

async function loadPeopleData() {
  try {
    const response = await fetch('/static/data/people.json');
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

function onCategoryChange() {
  document.getElementById('editForm').classList.add('hidden');
  document.getElementById('person-select').value = '';
  currentPeopleEditIndex = -1;
  populatePersonSelect();
}

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

  document.getElementById('edit-name').value            = person.name     || '';
  document.getElementById('edit-surname').value          = person.surname  || '';
  document.getElementById('edit-position').value         = person.position || '';
  document.getElementById('edit-order').value            = person.order    ?? '';
  document.getElementById('edit-from-to').value          = person['from-to'] || '';
  document.getElementById('edit-bio-editor').innerHTML   = person.bio      || '';

  SOCIAL_FIELDS.forEach(field => {
    const input = document.getElementById(`edit-${field}`);
    if (input) input.value = person[field] || '';
  });

  document.getElementById('edit-from-to-group').classList.toggle('hidden', category !== 'alumni');

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

  const orderValue = document.getElementById(`${prefix}-order`).value;
  person.order = orderValue !== '' ? orderValue : '';

  if (category === 'alumni') {
    const fromTo = document.getElementById(`${prefix}-from-to`);
    person['from-to'] = fromTo ? fromTo.value : '';
  }

  return person;
}

async function savePerson() {
  syncEditor('edit-bio-editor', 'edit-bio');
  if (currentPeopleEditIndex < 0) return;

  const person = buildPersonFromForm('edit', currentEditCategory);
  person.bio = document.getElementById('edit-bio').value;

  peopleData[currentEditCategory][currentPeopleEditIndex] = person;

  try {
    const response = await fetch('/api/update-people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(peopleData),
    });
    if (response.ok) {
      alert('Person updated successfully!');
      await loadPeopleData();
      populatePersonSelect();
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
  const categorySelect = document.getElementById('create-category');
  const category = categorySelect ? categorySelect.value : 'current';

  const fromToGroup = document.getElementById('create-from-to-group');
  if (fromToGroup) fromToGroup.classList.toggle('hidden', category !== 'alumni');

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
    document.getElementById('clearImageBtn').style.display = '';
  };
  reader.readAsDataURL(file);
}

async function submitPerson() {
  syncEditor('create-gen-description-editor', 'create-gen-description');

  const category = document.getElementById('create-category').value;
  const person   = buildPersonFromForm('create', category);
  person.bio     = document.getElementById('create-gen-description').value;

  if (!person.name || !person.surname || !person.position || !person.bio) {
    alert('Name, surname, position and bio are required.');
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
      document.getElementById('newsForm').reset();
      document.getElementById('create-gen-description-editor').innerHTML = '';
      document.getElementById('create-image').dataset.custom = 'false';
      document.getElementById('clearImageBtn').style.display = 'none';
      togglePeopleFields(); // resets image preview to default
    } else {
      alert('Error publishing person.');
    }
  } catch (error) {
    console.error('Error submitting person:', error);
    alert('Error publishing person.');
  }
}