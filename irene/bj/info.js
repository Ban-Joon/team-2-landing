document.addEventListener("DOMContentLoaded", () => {
  // 공통 함수: url의 HTML을 가져와 id 위치에 삽입
  const loadComponent = async (url, placeholderId) => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();

      const placeholder = document.getElementById(placeholderId);
      if (placeholder) {
        placeholder.innerHTML = html;
      } else {
        console.warn(`Placeholder #${placeholderId} 없음`);
      }
    } catch (err) {
      console.error(`Error loading ${url}:`, err);
    }
  };

  // 헤더와 푸터 불러오기
  loadComponent("header.html", "header-placeholder");
  loadComponent("footer.html", "footer-placeholder");
});
