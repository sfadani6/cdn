/**
 * ===================================================================
 * SF Lecture One 테마 - 클래식 에디터용 마크다운 편집 기능 (양방향 자동 변환)
 * ===================================================================
 *
 * 이 스크립트는 클래식 에디터에 '마크업' 탭을 추가하고,
 * HTML과 마크다운 간의 양방향 자동 변환 기능을 제공합니다.
 *
 * @features
 * - 마크업 -> HTML: 타이핑 후 자동 변환 (디바운싱 적용으로 성능 최적화)
 * - HTML -> 마크업: '마크업' 탭으로 전환 시 자동 역변환
 *
 * @dependencies
 * - marked.js (Markdown to HTML)
 * - turndown.js (HTML to Markdown)
 *
 * @class SFMarkdownEditor
 * @version 1.2.1
 */
class SFMarkdownEditor {
  /**
   * 클래스 생성자 (Constructor)
   * 객체가 생성될 때 가장 먼저 실행되는 초기 설정 영역입니다.
   */
  constructor() {
    // 1. 에디터의 핵심 UI 요소들을 찾아 클래스 속성(this.*)으로 저장하여, 클래스 내 어디서든 재사용할 수 있게 합니다.
    this.editorTabs = document.querySelector(
      "#wp-content-editor-tools .wp-editor-tabs"
    );
    this.wpEditorContainer = document.getElementById(
      "wp-content-editor-container"
    );
    this.visualTab = document.getElementById("content-tmce");
    this.codeTab = document.getElementById("content-html");

    // 2. HTML -> 마크다운 변환을 위한 TurndownService 인스턴스를 생성하고 옵션을 설정합니다.
    this.turndownService = new TurndownService({
      headingStyle: "atx", // h1 태그를 '# h1' 스타일로 변환
      codeBlockStyle: "fenced", // code 블록을 ```...``` 스타일로 변환
    });

    // 3. 디바운스(Debounce) 헬퍼 함수를 정의합니다.
    //    이벤트의 연속 발생을 그룹화하여 마지막 호출 후 일정 시간이 지나면 딱 한 번만 실행합니다.
    this.debounce = (func, delay) => {
      let timeout; // 타이머 ID를 저장할 변수
      return function (...args) {
        const context = this;
        clearTimeout(timeout); // 이전에 설정된 타이머가 있다면 취소
        timeout = setTimeout(() => func.apply(context, args), delay); // 새로운 타이머 설정
      };
    };

    // 4. 모든 준비가 끝나면 초기화 메서드를 호출하여 실제 동작을 시작합니다.
    this.init();
  }

  /**
   * 초기화 메서드 (Initializer)
   * 기능 구현에 필요한 함수들을 순서대로 호출하는 역할을 합니다.
   */
  init() {
    this.createUI();
    this.bindEvents();
    this.switchView("visual"); // 초기 화면은 '비주얼' 탭으로 설정
  }

  /**
   * UI 생성 메서드 (UI Creator)
   * '마크업' 탭과 입력 영역 등 필요한 HTML 요소들을 동적으로 생성합니다.
   */
  createUI() {
    // 이 스크립트 전용 CSS를 동적으로 생성하여 <head>에 삽입합니다.
    const cssRules = `
        #sf-lto-markup-tab { padding-left: 10px; padding-right: 10px; }
        #sf-lto-markup-tab.active { background: #f0f0f0; color: #333; border-bottom-color: #f0f0f0; }
    `;
    const styleElement = document.createElement("style");
    styleElement.textContent = cssRules;
    document.head.appendChild(styleElement);

    // '마크업' 탭 버튼 HTML을 생성하여 기존 탭 영역에 추가합니다.
    const markupTabHTML = `<button type="button" id="sf-lto-markup-tab" class="wp-switch-editor switch-html">마크업</button>`;
    this.editorTabs.insertAdjacentHTML("beforeend", markupTabHTML);

    // 마크다운 입력용 textarea HTML을 생성하여 에디터 컨테이너 뒤에 추가합니다.
    const markdownTextareaHTML = `<textarea id="sf-lto-markdown-textarea" style="display: none; width: 100%; height: 400px; font-family: 'D2Coding', monospace; padding: 10px; box-sizing: border-box; resize: vertical;"></textarea>`;
    this.wpEditorContainer.insertAdjacentHTML("afterend", markdownTextareaHTML);

    // 동적으로 생성된 요소들을 나중에 쉽게 제어할 수 있도록 클래스 속성에 할당합니다.
    this.markupTab = document.getElementById("sf-lto-markup-tab");
    this.markupTextarea = document.getElementById("sf-lto-markdown-textarea");
  }

  /**
   * 이벤트 바인딩 메서드 (Event Binder)
   * 생성된 UI 요소들에 사용자의 상호작용(클릭, 입력)을 감지하는 리스너를 연결합니다.
   */
  bindEvents() {
    // 각 탭 버튼 클릭 시, 기본 동작(페이지 이동 등)을 막고(e.preventDefault), 화면 전환 함수를 호출합니다.
    this.visualTab.addEventListener("click", (e) => {
      e.preventDefault();
      this.switchView("visual");
    });
    this.codeTab.addEventListener("click", (e) => {
      e.preventDefault();
      this.switchView("code");
    });
    this.markupTab.addEventListener("click", (e) => {
      e.preventDefault();
      this.switchView("markup");
    });

    // 마크업 textarea에 'input' 이벤트(키 입력, 붙여넣기 등)가 발생할 때마다 디바운싱 처리된 변환 함수를 실행합니다.
    const debouncedConvert = this.debounce(
      this.convertMarkupToHtml.bind(this),
      400
    ); // 0.4초 지연
    this.markupTextarea.addEventListener("input", debouncedConvert);
  }

  /**
   * 뷰 전환 메서드 (View Switcher/Router)
   * 사용자가 선택한 탭에 따라 적절한 UI를 보여주고 데이터 변환을 트리거합니다.
   * @param {string} viewName - 'visual', 'code', 'markup' 중 하나
   */
  switchView(viewName) {
    // 1. 모든 탭의 활성화 상태를 초기화합니다.
    this.visualTab.classList.remove("active");
    this.codeTab.classList.remove("active");
    this.markupTab.classList.remove("active");

    // 2. '비주얼' 또는 '코드' 탭으로 전환할 경우
    if (viewName === "visual" || viewName === "code") {
      this.wpEditorContainer.style.display = "block"; // 워드프레스 기본 에디터를 보여줌
      this.markupTextarea.style.display = "none"; // 마크업 textarea는 숨김

      const targetTab = viewName === "visual" ? this.visualTab : this.codeTab;
      targetTab.classList.add("active"); // 선택된 탭을 활성화

      // [오류 수정 완료] 워드프레스 내장 함수 `switchEditors.switchTo()`를 호출하여 에디터 모드를 공식적으로 전환합니다.
      // `switchEditors` 객체와 `switchTo` 함수가 존재하는지 확인하여 안정성을 높였습니다.
      if (
        typeof switchEditors !== "undefined" &&
        typeof switchEditors.switchTo === "function"
      ) {
        switchEditors.switchTo(targetTab);
      }
    }
    // 3. '마크업' 탭으로 전환할 경우
    else if (viewName === "markup") {
      this.wpEditorContainer.style.display = "none"; // 워드프레스 기본 에디터를 숨김
      this.markupTextarea.style.display = "block"; // 마크업 textarea를 보여줌
      this.markupTab.classList.add("active"); // 마크업 탭을 활성화

      // [핵심] 이 시점에 현재 에디터의 HTML을 마크다운으로 역변환하여 textarea에 채워 넣습니다.
      this.convertHtmlToMarkup();
    }
  }

  /**
   * HTML -> 마크다운 변환 메서드
   */
  convertHtmlToMarkup() {
    const contentTextarea = document.getElementById("content");
    if (contentTextarea) {
      const htmlContent = contentTextarea.value;
      const markdownContent = this.turndownService.turndown(htmlContent);
      this.markupTextarea.value = markdownContent;
    }
  }

  /**
   * 마크다운 -> HTML 변환 메서드
   */
  convertMarkupToHtml() {
    const markdownText = this.markupTextarea.value;

    // 내용이 비었으면 에디터도 비웁니다.
    if (markdownText.trim() === "") {
      document.getElementById("content").value = "";
      const editor =
        typeof tinymce !== "undefined" ? tinymce.get("content") : null;
      if (editor) editor.setContent("");
      return;
    }

    // marked.js를 사용하여 마크다운을 HTML로 변환합니다.
    const htmlContent = marked.parse(markdownText, {
      gfm: true,
      breaks: true,
      sanitize: false,
    });

    // [중요] 변환된 HTML을 두 곳에 모두 업데이트합니다.
    // 1. 원본 #content textarea: 글 저장 시 사용되는 실제 데이터
    document.getElementById("content").value = htmlContent;
    // 2. TinyMCE 인스턴스: '비주얼' 탭에서 사용자에게 보여지는 화면
    const editor =
      typeof tinymce !== "undefined" ? tinymce.get("content") : null;
    if (editor) editor.setContent(htmlContent);
  }
}

/**
 * DOMContentLoaded 이벤트 리스너 (스크립트 진입점)
 * HTML 문서가 완전히 로드되고 파싱되었을 때 SFMarkdownEditor 클래스의 인스턴스를 생성하여 스크립트를 실행합니다.
 */
document.addEventListener("DOMContentLoaded", function () {
  // [안전장치] 클래식 에디터가 존재하는 페이지에서만 스크립트를 실행하여 오류를 방지합니다.
  if (document.getElementById("wp-content-editor-container")) {
    new SFMarkdownEditor();
  }
});
