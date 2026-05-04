// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = {
  paper:  '/static/images/news/Books_Franceschini_3-2021_cropped.webp',
  member: '/static/images/news/FBK_Povo_Building_Baroni_6_cropped.webp',
  tool:   '/static/images/news/Keyboard_Franceschini_cropped.webp',
  other:  '/static/images/news/FBK_Povo_Building_Baroni_6_cropped.webp',
};

// ─── State ────────────────────────────────────────────────────────────────────

let newsData = [];
let currentEditIndex = -1;

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
  initToolbar('editorToolbar', 'edit-description-editor');
  initToolbar('createEditorToolbar', 'create-description-editor');
  initToolbar('createGenEditorToolbar', 'create-gen-description-editor');

  document.getElementById('dateField').value = new Date().toISOString().split('T')[0];

  // Explicitly initialize the custom flag before toggleFields runs
  const createImageHidden = document.getElementById('create-image');
  createImageHidden.dataset.custom = 'false';

  loadNewsData();
  toggleFields();

  document.getElementById('editImageFile')
    .addEventListener('change', handleEditImageFileChange);
  document.getElementById('createImageFile')
    .addEventListener('change', handleCreateImageFileChange);
});

// ─── Tab switching ────────────────────────────────────────────────────────────

function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabName + '-tab').classList.add('active');
  event.target.classList.add('active');
}

// ─── Rich text editor ─────────────────────────────────────────────────────────

function initToolbar(toolbarId, editorId) {
  const toolbar = document.getElementById(toolbarId);
  const editor  = document.getElementById(editorId);
  if (!toolbar || !editor) return;

  toolbar.addEventListener('mousedown', function (e) {
    const btn = e.target.closest('.toolbar-btn');
    if (!btn) return;
    e.preventDefault(); // keep focus in editor
    const cmd = btn.dataset.cmd;
    if (cmd === 'createLink') {
      const url = prompt('Enter URL:');
      if (url) document.execCommand('createLink', false, url);
    } else {
      document.execCommand(cmd, false, null);
    }
    updateToolbarState(toolbarId);
  });

  editor.addEventListener('keyup',   () => updateToolbarState(toolbarId));
  editor.addEventListener('mouseup', () => updateToolbarState(toolbarId));
  editor.addEventListener('focus',   () => updateToolbarState(toolbarId));
}

function updateToolbarState(toolbarId) {
  const cmds = ['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList'];
  cmds.forEach(cmd => {
    const btn = document.querySelector(`#${toolbarId} .toolbar-btn[data-cmd="${cmd}"]`);
    if (btn) btn.classList.toggle('active', document.queryCommandState(cmd));
  });
}

function syncEditor(editorId, textareaId) {
  const editor   = document.getElementById(editorId);
  const textarea = document.getElementById(textareaId);
  if (editor && textarea) textarea.value = editor.innerHTML;
}

// ─── News data loading ────────────────────────────────────────────────────────

async function loadNewsData() {
  try {
    const response = await fetch('/static/data/new-news.json');
    newsData = await response.json();
    populateNewsSelect();
  } catch (error) {
    console.error('Error loading news data:', error);
  }
}

function populateNewsSelect() {
  const select = document.getElementById('news-select');
  select.innerHTML = '<option value="">Choose a news item...</option>';
  newsData.forEach((item, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = item.Title;
    select.appendChild(option);
  });
}

// ─── Edit tab ─────────────────────────────────────────────────────────────────

function loadNewsForEdit() {
  const select = document.getElementById('news-select');
  const index  = parseInt(select.value);

  if (isNaN(index) || index < 0 || index >= newsData.length) {
    document.getElementById('editForm').classList.add('hidden');
    return;
  }

  currentEditIndex = index;
  const item = newsData[index];

  document.getElementById('edit-title').value               = item.Title       || '';
  document.getElementById('edit-date').value                = item.Date        || '';
  document.getElementById('edit-description-editor').innerHTML = item.Description || '';
  document.getElementById('edit-link').value                = item.Link        || '';
  document.getElementById('edit-show-always').checked       = item.ShowAlways  || false;
  setEditImagePreview(item.Image || '');

  document.getElementById('editForm').classList.remove('hidden');
}

function setEditImagePreview(src) {
  const img         = document.getElementById('editImagePreviewImg');
  const placeholder = document.getElementById('editImagePlaceholder');
  const hidden      = document.getElementById('edit-image');

  if (src) {
    img.src               = src;
    img.style.display     = 'block';
    placeholder.style.display = 'none';
    hidden.value          = src;
  } else {
    img.src               = '';
    img.style.display     = 'none';
    placeholder.style.display = 'block';
    hidden.value          = '';
  }
}

function handleEditImageFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => setEditImagePreview(reader.result);
  reader.readAsDataURL(file);
}

async function saveEditedNews() {
  syncEditor('edit-description-editor', 'edit-description');
  if (currentEditIndex < 0) return;

  const updatedItem = {
    Title:      document.getElementById('edit-title').value,
    Date:       document.getElementById('edit-date').value,
    Description:document.getElementById('edit-description').value,
    Link:       document.getElementById('edit-link').value,
    Image:      document.getElementById('edit-image').value,
    ShowAlways: document.getElementById('edit-show-always').checked,
  };

  newsData[currentEditIndex] = updatedItem;

  try {
    const response = await fetch('/api/update-news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newsData }),
    });
    if (response.ok) {
      alert('News item updated successfully!');
      loadNewsData();
    } else {
      alert('Error updating news item.');
    }
  } catch (error) {
    console.error('Error saving news:', error);
    alert('Error saving news item.');
  }
}

async function deleteNews() {
  if (currentEditIndex < 0) return;
  if (!confirm('Are you sure you want to delete this news item?')) return;

  newsData.splice(currentEditIndex, 1);

  try {
    const response = await fetch('/api/update-news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newsData }),
    });
    if (response.ok) {
      alert('News item deleted successfully!');
      currentEditIndex = -1;
      document.getElementById('editForm').classList.add('hidden');
      document.getElementById('news-select').value = '';
      loadNewsData();
    } else {
      alert('Error deleting news item.');
    }
  } catch (error) {
    console.error('Error deleting news:', error);
    alert('Error deleting news item.');
  }
}

// ─── Create tab ───────────────────────────────────────────────────────────────

function toggleFields() {
  const type    = document.getElementById('newsType').value;
  const isOther = type === 'other';

  document.getElementById('paperFields').classList.toggle('hidden',  type !== 'paper');
  document.getElementById('memberFields').classList.toggle('hidden', type !== 'member');
  document.getElementById('toolFields').classList.toggle('hidden',   type !== 'tool');

  // Always show the preview panel; just clear generated fields when switching
  document.getElementById('create-title').value = '';
  document.getElementById('create-gen-description-editor').innerHTML = '';

  updateDefaultImagePreview(type);
}

function updateDefaultImagePreview(type) {
  const hidden = document.getElementById('create-image');
  if (hidden.dataset.custom === 'true') return;

  const src = DEFAULT_IMAGES[type] || '/static/images/news/FBK_Povo_Building_Baroni_6_cropped.webp';
  const img = document.getElementById('createImagePreviewImg');

  img.src = src;
  hidden.value = src;
}

function handleCreateImageFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img         = document.getElementById('createImagePreviewImg');
    const placeholder = document.getElementById('createImagePlaceholder');
    const hidden      = document.getElementById('create-image');

    img.src               = reader.result;
    img.style.display     = 'block';
    placeholder.style.display = 'none';
    hidden.value          = reader.result;
    hidden.dataset.custom = 'true';
    document.getElementById('clearImageBtn').style.display = '';
  };
  reader.readAsDataURL(file);
}

function clearCreateImage() {
  const hidden = document.getElementById('create-image');
  hidden.dataset.custom = 'false';
  document.getElementById('createImageFile').value = '';
  document.getElementById('clearImageBtn').style.display = 'none';
  updateDefaultImagePreview(document.getElementById('newsType').value);
}

function getFormData() {
  const data = {};
  new FormData(document.getElementById('newsForm')).forEach((v, k) => data[k] = v);
  return data;
}

function buildTitleAndDescription(type, formData) {
  let title = '', description = '';
  switch (type) {
    case 'paper':
      title       = `New ${formData.paperType}: ${formData.paperTitle}`;
      description = `Our new ${formData.paperType} "${formData.paperTitle}" ${formData.venue || 'is available out'}.\n\n${formData.abstract}`;
      break;
    case 'member':
      title       = `Welcome ${formData.memberName} to the team!`;
      description = `${formData.memberFullName} joins the MoST research unit as an ${formData.position}, ${formData.jobDescription}`;
      break;
    case 'tool':
      title       = formData.version && formData.version.trim()
        ? `${formData.toolName} version ${formData.version} is out!`
        : `${formData.toolName} is out!`;
      description = formData.toolDescription;
      break;
  }
  return { title, description };
}

// Convert plain text with newlines to HTML paragraphs
function textToHtml(text) {
  return text
    .split(/\n\n+/)
    .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function showPreview() {
  const type     = document.getElementById('newsType').value;
  const formData = getFormData();

  if (type !== 'other') {
    const { title, description } = buildTitleAndDescription(type, formData);
    document.getElementById('create-title').value = title;
    document.getElementById('create-gen-description-editor').innerHTML = textToHtml(description);
  }

  const hidden = document.getElementById('create-image');
  if (hidden.dataset.custom !== 'true') {
    updateDefaultImagePreview(type);
  }

  syncEditor('create-description-editor',     'create-description');
  syncEditor('create-gen-description-editor', 'create-gen-description');

  document.getElementById('previewBox').classList.remove('hidden');
}

function getFinalCreateData() {
  syncEditor('create-description-editor',     'create-description');
  syncEditor('create-gen-description-editor', 'create-gen-description');

  const type     = document.getElementById('newsType').value;
  const formData = getFormData();
  let title, description;

  if (type === 'other') {
    title       = formData.otherTitle;
    description = document.getElementById('create-description').value;
  } else {
    title       = document.getElementById('create-title').value;
    description = document.getElementById('create-gen-description').value;
    // Fallback if user never clicked Preview
    if (!title || !description) {
      const generated = buildTitleAndDescription(type, formData);
      title       = title       || generated.title;
      description = description || textToHtml(generated.description);
    }
  }

  return {
    Title:      title,
    Description:description,
    Date:       formData.date || new Date().toISOString().split('T')[0],
    Link:       formData.link || '',
    Image:      document.getElementById('create-image').value || DEFAULT_IMAGES[type] || '',
    ShowAlways: false,
  };
}

async function submitFinal() {
  const data = getFinalCreateData();

  if (!data.Title || !data.Description) {
    alert('Title and description are required.');
    return;
  }

  // Append the new item so it appears at the end of the news list
  const updatedNewsData = [...newsData, data];

  try {
    const response = await fetch('/api/update-news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newsData: updatedNewsData }),
    });

    if (response.ok) {
      alert('News item published successfully!');
      // Reload news data and reset the form
      await loadNewsData();
      document.getElementById('newsForm').reset();
      document.getElementById('previewBox').classList.add('hidden');
      document.getElementById('create-gen-description-editor').innerHTML = '';
      document.getElementById('create-title').value = '';
      toggleFields(); // resets image preview to default
    } else {
      alert('Error publishing news item.');
    }
  } catch (error) {
    console.error('Error submitting news:', error);
    alert('Error publishing news item.');
  }
}