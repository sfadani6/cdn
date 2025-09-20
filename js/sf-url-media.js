/**
 * ===================================================================
 * SF Lecture One 테마 - URL 미디어 탭 관련 스크립트 (캡션 기능 추가)
 * ===================================================================
 *
 * 이 파일은 미디어 라이브러리의 'URL미디어' 탭에서
 * JSON 목록 로드, 2단 레이아웃 UI 제어, 아이템 선택 및
 * 에디터 삽입 기능을 담당합니다.
 *
 * @package sf-lecture-one
 */

class SfUrlMediaJson {
  /**
   * 클래스 생성자
   */
  constructor() {
    this.mediaData = null;
    this.selectedItem = null;

    // '글에 삽입' 버튼에 대한 클릭 이벤트를 전역에서 감지 (이벤트 위임)
    document.addEventListener("click", (event) => {
      if (event.target && event.target.id === "sf-lto-insert-media-btn") {
        this.insertIntoEditor();
      }
    });
  }

  /**
   * 선택된 URL로부터 JSON 데이터를 비동기적으로 불러옵니다.
   */
  loadJson() {
    const selectEl = document.getElementById("sf-lto-json-source-select");
    const gridContainerEl = document.getElementById(
      "sf-lto-media-grid-container"
    );
    const insertBtn = document.getElementById("sf-lto-insert-media-btn");
    const detailsPanel = document.getElementById(
      "sf-lto-media-details-container"
    );

    if (!selectEl || !gridContainerEl || !insertBtn || !detailsPanel) {
      console.error("필수 UI 요소를 찾을 수 없습니다.");
      return;
    }

    const selectedUrl = selectEl.value;
    if (!selectedUrl) {
      alert("불러올 JSON 파일의 URL을 선택해주세요.");
      return;
    }

    // UI 상태 초기화
    gridContainerEl.innerHTML = "<p>데이터를 불러오는 중입니다...</p>";
    insertBtn.disabled = true;
    detailsPanel.classList.remove("is-visible");
    this.selectedItem = null;

    fetch(selectedUrl)
      .then((response) => {
        if (!response.ok)
          throw new Error(`네트워크 응답 오류 (상태: ${response.status})`);
        return response.json();
      })
      .then((data) => {
        this.mediaData = data;
        console.log("JSON 데이터 로드 성공:", this.mediaData);
        this.drawJson();
      })
      .catch((error) => {
        console.error("JSON 데이터 로드 중 에러:", error);
        gridContainerEl.innerHTML = `<p style="color: red;">데이터 로드에 실패했습니다. 개발자 콘솔을 확인해주세요.</p>`;
        alert("데이터 로드에 실패했습니다. URL이 유효한지 확인해주세요.");
      });
  }

  /**
   * 불러온 JSON 데이터를 기반으로 화면에 그리드 UI를 그립니다.
   */
  drawJson() {
    const gridContainerEl = document.getElementById(
      "sf-lto-media-grid-container"
    );
    if (!gridContainerEl) return;

    if (
      !this.mediaData ||
      !this.mediaData.tree ||
      !Array.isArray(this.mediaData.tree.children)
    ) {
      console.error("유효하지 않은 JSON 데이터 구조입니다.");
      gridContainerEl.innerHTML =
        "<p>데이터를 표시할 수 없습니다. JSON 구조를 확인해주세요.</p>";
      return;
    }

    const allImagesHtml = this.generateImageItems(this.mediaData.tree.children);

    if (allImagesHtml) {
      gridContainerEl.innerHTML = `<ul class="sf-lto-media-grid">${allImagesHtml}</ul>`;
      this.setupItemSelection();
    } else {
      gridContainerEl.innerHTML = "<p>표시할 이미지가 없습니다.</p>";
    }
  }

  /**
   * [재귀 함수] 아이템 배열을 탐색하여 이미지 아이템의 HTML을 생성합니다.
   * @param {Array} items - 아이템 배열
   * @returns {string} - <li> HTML 문자열
   */
  generateImageItems(items) {
    let html = "";
    items.forEach((item) => {
      if (item.type === "img") {
        html += `
                    <li class="sf-lto-media-item" data-path="${item.path}" title="${item.filename}">
                        <div class="sf-lto-media-item__thumbnail">
                            <img src="${item.thumburl}" alt="${item.filename}" loading="lazy">
                        </div>
                        <div class="sf-lto-media-item__filename">${item.filename}</div>
                    </li>
                `;
      } else if (item.type === "folder" && Array.isArray(item.children)) {
        html += this.generateImageItems(item.children);
      }
    });
    return html;
  }

  /**
   * 썸네일 아이템 클릭 시 선택/해제 및 상세 정보 업데이트 기능을 설정합니다.
   */
  setupItemSelection() {
    const grid = document.querySelector(".sf-lto-media-grid");
    if (!grid) return;

    grid.addEventListener("click", (event) => {
      const clickedItem = event.target.closest(".sf-lto-media-item");
      if (!clickedItem) return;

      const previouslySelected = grid.querySelector(
        ".sf-lto-media-item.selected"
      );
      if (previouslySelected) {
        previouslySelected.classList.remove("selected");
      }
      clickedItem.classList.add("selected");

      const itemPath = clickedItem.dataset.path;
      this.selectedItem = this.findItemByPath(
        this.mediaData.tree.children,
        itemPath
      );

      if (this.selectedItem) {
        console.log("선택된 아이템:", this.selectedItem);
        this.updateDetailsPanel();
        document.getElementById("sf-lto-insert-media-btn").disabled = false;
      }
    });
  }

  /**
   * 경로(path)를 기준으로 원본 데이터 객체를 재귀적으로 찾습니다.
   * @param {Array} items - 아이템 배열
   * @param {string} path - 찾을 아이템의 경로
   * @returns {object|null} - 찾은 아이템 객체 또는 null
   */
  findItemByPath(items, path) {
    for (const item of items) {
      if (item.path === path) return item;
      if (item.type === "folder" && item.children) {
        const found = this.findItemByPath(item.children, path);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * 오른쪽 상세 정보 패널의 내용을 업데이트합니다.
   */
  updateDetailsPanel() {
    const detailsPanel = document.getElementById(
      "sf-lto-media-details-container"
    );
    if (!this.selectedItem || !detailsPanel) return;

    detailsPanel.classList.add("is-visible");

    document.getElementById("sf-lto-details-thumb").src =
      this.selectedItem.thumburl;
    document.getElementById("sf-lto-details-filename").textContent =
      this.selectedItem.filename;
    document.getElementById("sf-lto-details-dimensions").textContent =
      this.selectedItem.resolution;
    document.getElementById("sf-lto-details-filesize").textContent = `${(
      this.selectedItem.size / 1024
    ).toFixed(1)} KB`;

    document.getElementById("sf-lto-details-alt").value =
      this.selectedItem.name;
    document.getElementById("sf-lto-details-title").value =
      this.selectedItem.name;
    document.getElementById("sf-lto-details-caption").value = "";
    document.getElementById("sf-lto-details-description").value = "";
    document.getElementById("sf-lto-details-url").value = this.selectedItem.url;
  }

  /**
   * 선택된 이미지를 에디터에 삽입합니다.
   */
  insertIntoEditor() {
    if (!this.selectedItem) {
      alert("삽입할 이미지를 선택해주세요.");
      return;
    }

    const imageUrl = this.selectedItem.url;
    const altText = document.getElementById("sf-lto-details-alt").value;
    const titleText = document.getElementById("sf-lto-details-title").value;
    const captionText = document.getElementById("sf-lto-details-caption").value;

    let html;

    if (captionText.trim() !== "") {
      // 캡션이 있으면 [caption] 쇼트코드를 생성합니다.
      html = `[caption align="alignnone" width=""]<img src="${imageUrl}" alt="${altText}" title="${titleText}" /> ${captionText}[/caption]`;
    } else {
      // 캡션이 없으면 일반 <img> 태그만 생성합니다.
      html = `<img src="${imageUrl}" alt="${altText}" title="${titleText}" />`;
    }

    // 클래식 에디터(TinyMCE)에 삽입하는 표준 방식
    if (typeof window.parent.send_to_editor === "function") {
      window.parent.send_to_editor(html);
      window.parent.tb_remove(); // 미디어 라이브러리 닫기
    } else {
      alert("에디터를 찾을 수 없습니다.");
    }
  }
}

// 클래스의 인스턴스를 전역 변수로 생성합니다.
const sfUrlMediaManager = new SfUrlMediaJson();
