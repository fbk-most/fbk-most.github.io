function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabName + '-tab').classList.add('active');
  event.target.classList.add('active');
}

function initToolbar(toolbarId, editorId) {
  const toolbar = document.getElementById(toolbarId);
  const editor = document.getElementById(editorId);
  if (!toolbar || !editor) return;

  toolbar.addEventListener('mousedown', function (e) {
    const btn = e.target.closest('.toolbar-btn');
    if (!btn) return;

    e.preventDefault();

    const cmd = btn.dataset.cmd;

    if (cmd === 'createLink') {
      const url = prompt('Enter URL:');
      if (url) document.execCommand('createLink', false, url);
    } else {
      document.execCommand(cmd, false, null);
    }

    updateToolbarState(toolbarId);
  });

  editor.addEventListener('keyup', () => updateToolbarState(toolbarId));
  editor.addEventListener('mouseup', () => updateToolbarState(toolbarId));
  editor.addEventListener('focus', () => updateToolbarState(toolbarId));
}

function updateToolbarState(toolbarId) {
  const cmds = [
    'bold',
    'italic',
    'underline',
    'insertUnorderedList',
    'insertOrderedList'
  ];

  cmds.forEach(cmd => {
    const btn = document.querySelector(
      `#${toolbarId} .toolbar-btn[data-cmd="${cmd}"]`
    );

    if (btn) {
      btn.classList.toggle('active', document.queryCommandState(cmd));
    }
  });
}

function syncEditor(editorId, textareaId) {
  const editor = document.getElementById(editorId);
  const textarea = document.getElementById(textareaId);

  if (editor && textarea) {
    textarea.value = editor.innerHTML;
  }
}

function setImagePreview(imgId, placeholderId, hiddenId, src) {
  const img = document.getElementById(imgId);
  const placeholder = document.getElementById(placeholderId);
  const hidden = document.getElementById(hiddenId);

  if (src) {
    img.src = src;
    img.style.display = 'block';

    if (placeholder) placeholder.style.display = 'none';

    hidden.value = src;
  } else {
    img.src = '';
    img.style.display = 'none';

    if (placeholder) placeholder.style.display = 'block';

    hidden.value = '';
  }
}

function previewUploadedImage(event, callback) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => callback(reader.result);
  reader.readAsDataURL(file);
}