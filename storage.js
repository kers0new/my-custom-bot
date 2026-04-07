export const STORAGE_KEY = 'scripts_board_v1';
export const LIB_KEY = 'scripts_board_library_v1';

export function loadPosts(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return [];
    return JSON.parse(raw);
  }catch(e){
    console.error('loadPosts', e);
    return [];
  }
}

export function savePosts(posts){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }catch(e){
    console.error('savePosts', e);
  }
}

export function addPost(post){
  const posts = loadPosts();
  posts.unshift(post);
  savePosts(posts);
}

export function clearPosts(){
  localStorage.removeItem(STORAGE_KEY);
}

/* Library storage */
export function loadLibrary(){
  try{
    const raw = localStorage.getItem(LIB_KEY);
    if(!raw) return [];
    return JSON.parse(raw);
  }catch(e){
    console.error('loadLibrary', e);
    return [];
  }
}

export function saveLibrary(items){
  try{
    localStorage.setItem(LIB_KEY, JSON.stringify(items));
  }catch(e){
    console.error('saveLibrary', e);
  }
}

export function addLibraryItem(item){
  const items = loadLibrary();
  items.unshift(item);
  saveLibrary(items);
}

export function clearLibrary(){
  localStorage.removeItem(LIB_KEY);
}