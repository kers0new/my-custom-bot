import { loadPosts, addPost, savePosts, clearPosts, loadLibrary, addLibraryItem, saveLibrary, clearLibrary } from './storage.js';
import { createPostElement } from './postTemplate.js';
import dayjs from 'dayjs';

const el = {
  title: document.getElementById('title'),
  type: document.getElementById('type'),
  content: document.getElementById('content'),
  author: document.getElementById('author'),
  postBtn: document.getElementById('postBtn'),
  feed: document.getElementById('feed'),
  error: document.getElementById('error'),
  search: document.getElementById('search'),
  filterType: document.getElementById('filterType'),
  clearAll: document.getElementById('clearAll'),
};

let posts = loadPosts();
let library = loadLibrary();

/* Utilities */
function uid(){
  return Math.random().toString(36).slice(2,9);
}
function timeLabel(ts){
  return dayjs(ts).format('YYYY-MM-DD HH:mm');
}

/* Validation: block suspicious remote-execution code like loadstring, HttpGet remote loads, or obvious obfuscation */
function isBlockedContent(text){
  if(!text) return false;
  const lower = text.toLowerCase();
  const blocked = ['loadstring', 'loadstring(', 'game:httPget'.toLowerCase(), 'httpget', 'syn.request', 'http.request', 'rconsole', 'rconsoleprint'];
  return blocked.some(b => lower.includes(b));
}

function ensureSampleLibrary(){
  // populate a few sample shared scripts if library is empty
  if(library && library.length) return;
  library = [
    {
      id: uid(),
      title: 'Hello World (Lua)',
      type: 'script',
      content: '-- Hello World sample\nprint("Hello, world!")',
      author: 'system',
      ts: Date.now()
    },
    {
      id: uid(),
      title: 'Free Robux Code (example)',
      type: 'roblox-code',
      content: 'RBX-EXAMPLE-1234\n(This is a placeholder example code.)',
      author: 'community',
      ts: Date.now() - 1000*60*60
    },
    {
      id: uid(),
      title: 'Useful Snippet: Table Merge',
      type: 'script',
      content: '-- merge two tables\nfunction merge(a,b) for k,v in pairs(b) do a[k]=v end return a end',
      author: 'community',
      ts: Date.now() - 1000*60*120
    }
  ];
  saveLibrary(library);
}

function renderLibrary(typeFilter = 'all'){
  const libNode = document.getElementById('libraryFeed');
  libNode.innerHTML = '';
  const q = el.search.value.trim().toLowerCase();
  const list = library.filter(p=>{
    if(typeFilter !== 'all' && p.type !== typeFilter) return false;
    if(!q) return true;
    return (p.title||'').toLowerCase().includes(q) || (p.author||'').toLowerCase().includes(q) || (p.content||'').toLowerCase().includes(q);
  });

  if(list.length === 0){
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'No library items.';
    libNode.appendChild(empty);
    return;
  }

  for(const p of list){
    p.timeLabel = timeLabel(p.ts);
    const node = createPostElement(p, {isLibraryItem:true});
    libNode.appendChild(node);
  }
}

function render(){
  el.feed.innerHTML = '';
  const q = el.search.value.trim().toLowerCase();
  const filter = el.filterType.value;
  const list = posts.filter(p=>{
    if(filter !== 'all' && p.type !== filter) return false;
    if(!q) return true;
    return (p.title||'').toLowerCase().includes(q) || (p.author||'').toLowerCase().includes(q) || (p.content||'').toLowerCase().includes(q);
  });

  if(list.length === 0){
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'No posts yet — paste a script or code to share.';
    el.feed.appendChild(empty);
    return;
  }

  for(const p of list){
    p.timeLabel = timeLabel(p.ts);
    const node = createPostElement(p);
    el.feed.appendChild(node);
  }
}

/* events */
el.postBtn.addEventListener('click', ()=>{
  el.error.textContent = '';
  const content = el.content.value.trim();
  if(!content){
    el.error.textContent = 'Content cannot be empty.';
    return;
  }
  if(isBlockedContent(content)){
    el.error.textContent = 'Posting of remote-execution or loadstring-like code is blocked.';
    return;
  }
  const post = {
    id: uid(),
    title: el.title.value.trim(),
    type: el.type.value,
    content,
    author: el.author.value.trim(),
    ts: Date.now()
  };
  posts.unshift(post);
  addPost(post);
  el.content.value = '';
  el.title.value = '';
  el.author.value = '';
  render();
});

// keyboard shortcut: Ctrl/Cmd + Enter to post from the content textarea
el.content.addEventListener('keydown', (e)=>{
  if((e.ctrlKey || e.metaKey) && e.key === 'Enter'){
    e.preventDefault();
    el.postBtn.click();
  }
});

el.search.addEventListener('input', debounce(render, 120));
el.filterType.addEventListener('change', render);

el.clearAll.addEventListener('click', ()=>{
  if(!confirm('Clear all local posts? This cannot be undone.')) return;
  posts = [];
  clearPosts();
  render();
});

/* Library controls */
const libTabs = document.querySelectorAll('.library .tab');
libTabs.forEach(t=>{
  t.addEventListener('click', (ev)=>{
    libTabs.forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    const type = t.dataset.type;
    renderLibrary(type);
  });
});

document.getElementById('refreshLibrary').addEventListener('click', ()=>{
  library = loadLibrary();
  const active = document.querySelector('.library .tab.active')?.dataset.type || 'all';
  renderLibrary(active);
});

document.getElementById('clearLibrary').addEventListener('click', ()=>{
  if(!confirm('Clear the shared library? This removes all library items from local machine.')) return;
  library = [];
  clearLibrary();
  renderLibrary();
});

/* handle remove post events from template */
window.addEventListener('remove-post', (e)=>{
  const id = e.detail.id;
  posts = posts.filter(p=>p.id !== id);
  savePosts(posts);
  render();
});

window.addEventListener('add-library-item', (e)=>{
  const item = e.detail.post;
  // don't duplicate by content+title
  if(library.some(l=>l.content === item.content && l.title === item.title)) return;
  const newItem = Object.assign({}, item, {id: uid(), ts: Date.now()});
  library.unshift(newItem);
  addLibraryItem(newItem);
  renderLibrary(document.querySelector('.library .tab.active')?.dataset.type || 'all');
});

window.addEventListener('remove-library-item', (e)=>{
  const id = e.detail.id;
  library = library.filter(l=>l.id !== id);
  saveLibrary(library);
  renderLibrary(document.querySelector('.library .tab.active')?.dataset.type || 'all');
});

function debounce(fn, ms=120){
  let t;
  return (...a)=>{ clearTimeout(t); t = setTimeout(()=>fn(...a), ms); };
}

/* initial render */
ensureSampleLibrary();
renderLibrary('all');
render();

// focus the content area so you can paste/type immediately
try{ el.content.focus(); }catch(e){/* ignore */}

/* start-up hint: nothing else; app should be ready */