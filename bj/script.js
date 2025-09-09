/* =========================================================
   커뮤니티 게시판 (3페이지 버전)
   - list.html    : 제목 리스트 + 검색
   - new.html     : 새 글 작성 (저장 후 list로 이동)
   - detail.html  : 본문 보기 + 좋아요 + 댓글(등록/삭제) + 간단 수정/삭제
   ---------------------------------------------------------
   데이터는 브라우저 localStorage에 저장/유지됨.
   (서버 없이 로컬에서 학습/연습용으로 쓰기 좋다)
========================================================= */

/** -------------------------
 * 데이터 형태 정의 (참고용 JSDoc)
 * Post: {
 *   id: string,
 *   title: string,
 *   content: string,
 *   createdAt: number,  // ms 타임스탬프
 *   likes: number,
 *   comments: Comment[]
 * }
 *
 * Comment: {
 *   id: string,
 *   author: string,     // 빈 문자열이면 "익명"으로 표시
 *   text: string,
 *   createdAt: number
 * }
 * ------------------------- */

// localStorage 저장 키(버전 바꿔도 됨)
const STORAGE_KEY = "community_posts_v3";

/* ========== 공통 유틸 함수들 ========== */

/** localStorage에서 posts 배열 가져오기 (없으면 빈 배열) */
function loadPosts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    // 혹시 구조가 틀어져 있어도 최소 필드를 보정
    return (Array.isArray(data) ? data : []).map(p => ({
      id: String(p.id ?? genId("post")),
      title: String(p.title ?? ""),
      content: String(p.content ?? ""),
      createdAt: Number(p.createdAt ?? Date.now()),
      likes: Number(p.likes ?? 0),
      comments: Array.isArray(p.comments) ? p.comments.map(c => ({
        id: String(c.id ?? genId("cmt")),
        author: String(c.author ?? ""),
        text: String(c.text ?? ""),
        createdAt: Number(c.createdAt ?? Date.now()),
      })) : [],
    }));
  } catch {
    return [];
  }
}

/** posts 배열을 localStorage에 저장 */
function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

/** 간단 고유 ID 생성 (충돌 확률 낮음) */
function genId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now()}`;
}

/** URL의 쿼리스트링에서 특정 파라미터 값 가져오기 */
function getParam(name) {
  const sp = new URLSearchParams(location.search);
  return sp.get(name);
}

/** 안전한 텍스트 변환(간단 XSS 방지용) */
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ========== 페이지 초기화 진입점 ========== */
window.addEventListener("DOMContentLoaded", () => {
  // 어떤 페이지인지 body의 data-page 속성으로 구분
  const page = document.body.dataset.page;

  if (page === "list") initListPage();
  if (page === "new") initNewPage();
  if (page === "detail") initDetailPage();
});

/* =========================================================
   LIST PAGE (list.html)
   - 제목만 보여줌
   - 검색 가능(제목 기준)
   - 항목 클릭 시 detail.html?id=... 로 이동
========================================================= */
function initListPage() {
  const posts = loadPosts()
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt); // 최신순

  const searchInput = document.getElementById("searchInput");
  const titleList = document.getElementById("titleList");
  const emptyListHint = document.getElementById("emptyListHint");

  // 리스트 렌더 함수
  function render() {
    const q = (searchInput.value || "").toLowerCase().trim();

    // 제목에 검색어 포함된 게시글만 필터
    const filtered = posts.filter(p => p.title.toLowerCase().includes(q));

    // 결과가 없을 때 안내 문구 표시
    emptyListHint.hidden = filtered.length !== 0;

    // HTML 문자열 생성
    titleList.innerHTML = filtered.map(p => {
      const dateStr = new Date(p.createdAt).toLocaleString();
      // detail.html로 이동하는 링크에 ?id=를 붙여 전달
      return `
        <li>
          <a class="title" href="detail.html?id=${encodeURIComponent(p.id)}">
            ${escapeHtml(p.title)}
          </a>
          <span class="meta">${dateStr} · 좋아요 ${p.likes} · 댓글 ${p.comments.length}</span>
        </li>
      `;
    }).join("");
  }

  // 검색 입력 시마다 렌더
  searchInput.addEventListener("input", render);

  // 최초 1회 렌더
  render();
}

/* =========================================================
   NEW PAGE (new.html)
   - 제목/내용 입력 → 저장 → list.html로 이동
========================================================= */
function initNewPage() {
  const titleInput = document.getElementById("titleInput");
  const contentInput = document.getElementById("contentInput");
  const savePostBtn = document.getElementById("savePostBtn");

  // UX: 페이지 진입 시 제목에 포커스
  setTimeout(() => titleInput?.focus(), 0);

  savePostBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    // 기존 글들 로드 → 새 글 추가 → 저장
    const posts = loadPosts();
    posts.unshift({
      id: genId("post"),
      title,
      content,
      createdAt: Date.now(),
      likes: 0,
      comments: [],
    });
    savePosts(posts);

    // 저장 후 목록으로 이동
    location.href = "list.html";
  });
}

/* =========================================================
   DETAIL PAGE (detail.html)
   - URL의 ?id= 로 글 식별
   - 본문/좋아요/수정/삭제
   - 댓글 등록/삭제
========================================================= */
function initDetailPage() {
  // DOM 참조
  const notFound = document.getElementById("notFound");
  const article = document.getElementById("detailArticle");
  const detailTitle = document.getElementById("detailTitle");
  const detailDate = document.getElementById("detailDate");
  const detailLikes = document.getElementById("detailLikes");
  const detailContent = document.getElementById("detailContent");
  const likeBtn = document.getElementById("likeBtn");
  const editBtn = document.getElementById("editBtn");
  const deleteBtn = document.getElementById("deleteBtn");

  const commentSection = document.getElementById("commentSection");
  const commentAuthor = document.getElementById("commentAuthor");
  const commentText = document.getElementById("commentText");
  const addCommentBtn = document.getElementById("addCommentBtn");
  const commentList = document.getElementById("commentList");

  // URL에서 글 ID를 가져옴 (예: detail.html?id=post_..._123)
  const id = getParam("id");

  // 글 로드
  let posts = loadPosts();
  let post = posts.find(p => p.id === id);

  // 글이 없으면 안내
  if (!id || !post) {
    notFound.hidden = false;
    article.hidden = true;
    commentSection.hidden = true;
    return;
  }

  // 닉네임 자동 복원(마지막 사용값)
  commentAuthor.value = localStorage.getItem("last_comment_author") || "";

  // 상세 렌더링 함수
  function renderDetail() {
    // 최신 객체 참조(수정/좋아요 후 반영)
    posts = loadPosts();
    post = posts.find(p => p.id === id);
    if (!post) {
      // 삭제된 경우 등
      location.href = "list.html";
      return;
    }

    // 타이틀/작성일/좋아요
    detailTitle.textContent = post.title;
    detailDate.textContent = new Date(post.createdAt).toLocaleString();
    detailLikes.textContent = post.likes;

    // 본문은 textContent로 넣어 XSS 방지 (사용자 입력 그대로 표시)
    detailContent.textContent = post.content;

    // 댓글 렌더 (오래된 순)
    commentList.innerHTML = post.comments
      .slice()
      .sort((a, b) => a.createdAt - b.createdAt)
      .map(c => {
        const d = new Date(c.createdAt).toLocaleString();
        const author = c.author ? escapeHtml(c.author) : "익명";
        return `
          <li class="comment" data-id="${c.id}">
            <div class="comment-head">
              <span>${author} · ${d}</span>
              <div class="comment-actions">
                <button class="btn" data-action="del-comment">삭제</button>
              </div>
            </div>
            <div class="comment-body">${escapeHtml(c.text)}</div>
          </li>
        `;
      }).join("");

    // 섹션 표시
    notFound.hidden = true;
    article.hidden = false;
    commentSection.hidden = false;
  }

  // 좋아요
  likeBtn.addEventListener("click", () => {
    const posts = loadPosts();
    const p = posts.find(p => p.id === id);
    if (!p) return;
    p.likes += 1;
    savePosts(posts);
    renderDetail();
  });

  // 수정 (초보 흐름: prompt 2번으로 간단히 수정)
  editBtn.addEventListener("click", () => {
    const posts = loadPosts();
    const p = posts.find(p => p.id === id);
    if (!p) return;

    const newTitle = prompt("제목을 수정하세요:", p.title);
    if (newTitle === null) return; // 취소

    const newContent = prompt("내용을 수정하세요:", p.content);
    if (newContent === null) return;

    p.title = newTitle.trim();
    p.content = newContent.trim();
    savePosts(posts);
    renderDetail();
  });

  // 삭제
  deleteBtn.addEventListener("click", () => {
    if (!confirm("이 글을 삭제할까요?")) return;
    const posts = loadPosts().filter(p => p.id !== id);
    savePosts(posts);
    // 삭제 후 목록으로
    location.href = "list.html";
  });

  // 댓글 등록
  addCommentBtn.addEventListener("click", () => {
    const author = (commentAuthor.value || "").trim();
    const text = (commentText.value || "").trim();
    if (!text) { alert("댓글 내용을 입력하세요."); return; }

    const posts = loadPosts();
    const p = posts.find(p => p.id === id);
    if (!p) return;

    p.comments.push({
      id: genId("cmt"),
      author,
      text,
      createdAt: Date.now(),
    });
    savePosts(posts);

    // 닉네임 저장(편의)
    if (author) localStorage.setItem("last_comment_author", author);

    // 입력창 비우고 다시 렌더
    commentText.value = "";
    renderDetail();
  });

  // 댓글 삭제 (이벤트 위임)
  commentList.addEventListener("click", (e) => {
    const target = /** @type {HTMLElement} */(e.target);
    if (target?.dataset?.action !== "del-comment") return;

    if (!confirm("이 댓글을 삭제할까요?")) return;

    const item = target.closest(".comment");
    const cid = item?.getAttribute("data-id");
    if (!cid) return;

    const posts = loadPosts();
    const p = posts.find(p => p.id === id);
    if (!p) return;

    p.comments = p.comments.filter(c => c.id !== cid);
    savePosts(posts);
    renderDetail();
  });

  // 최초 렌더링
  renderDetail();
}
