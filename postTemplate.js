export function createPostElement(post, opts = {}) {
  const isLibrary = !!opts.isLibraryItem;
  const el = document.createElement('article');
  el.className = 'post';
  el.dataset.id = post.id;

  const meta = document.createElement('div');
  meta.className = 'meta';

  const left = document.createElement('div');
  left.className = 'left';

  const badge = document.createElement('div');
  badge.className = 'badge';
  badge.textContent = post.type === 'roblox-code' ? 'Roblox Code' : (post.type === 'script' ? 'Script' : 'Other');

  const title = document.createElement('div');
  title.innerHTML = `<div class="title">${escapeHtml(post.title || '(untitled)')}</div><div class="small">by ${escapeHtml(post.author || 'anon')} · ${post.timeLabel}</div>`;

  left.appendChild(badge);
  left.appendChild(title);

  const right = document.createElement('div');
  right.className = 'right small';
  right.textContent = post.id;

  meta.appendChild(left);
  meta.appendChild(right);

  const content = document.createElement('pre');
  content.className = 'content';
  content.textContent = post.content;

  const actions = document.createElement('div');
  actions.className = 'actions';

  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn copy';
  copyBtn.textContent = 'Copy';

  copyBtn.addEventListener('click', async ()=>{
    try{
      await navigator.clipboard.writeText(post.content);
      copyBtn.textContent = 'Copied';
      setTimeout(()=>copyBtn.textContent = 'Copy',1400);
    }catch(e){
      copyBtn.textContent = 'Copy';
    }
  });

  const viewBtn = document.createElement('button');
  viewBtn.className = 'btn';
  viewBtn.textContent = 'Open';
  viewBtn.addEventListener('click', ()=> {
    // open a minimal read-only view in a new window
    const w = window.open('', '_blank', 'noopener');
    const s = `
      <body style="margin:0;background:#04111b;color:#e6eef6;font-family:system-ui;padding:18px">
        <h3 style="margin:0 0 8px"> ${escapeHtml(post.title || '(untitled)')}</h3>
        <div style="color:#9aa4b2;margin-bottom:12px">by ${escapeHtml(post.author || 'anon')} · ${post.timeLabel}</div>
        <pre style="white-space:pre-wrap;background:#071224;padding:12px;border-radius:8px;overflow:auto">${escapeHtml(post.content)}</pre>
      </body>`;
    w.document.write(s);
    w.document.close();
  });

  actions.appendChild(copyBtn);
  actions.appendChild(viewBtn);

  if(isLibrary){
    const removeLib = document.createElement('button');
    removeLib.className = 'btn';
    removeLib.textContent = 'Remove from Library';
    removeLib.addEventListener('click', ()=>{
      const evt = new CustomEvent('remove-library-item', {detail:{id:post.id}});
      window.dispatchEvent(evt);
    });
    actions.appendChild(removeLib);
  } else {
    const addLib = document.createElement('button');
    addLib.className = 'btn';
    addLib.textContent = 'Add to Library';
    addLib.addEventListener('click', ()=>{
      const evt = new CustomEvent('add-library-item', {detail:{post}});
      window.dispatchEvent(evt);
      addLib.textContent = 'Added';
      setTimeout(()=>addLib.textContent = 'Add to Library',1400);
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'btn';
    delBtn.textContent = 'Remove';
    delBtn.addEventListener('click', ()=>{
      const evt = new CustomEvent('remove-post', {detail:{id:post.id}});
      window.dispatchEvent(evt);
    });

    actions.appendChild(addLib);
    actions.appendChild(delBtn);
  }

  el.appendChild(meta);
  el.appendChild(content);
  el.appendChild(actions);

  return el;
}

function escapeHtml(s){
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}