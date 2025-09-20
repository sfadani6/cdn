/**
 * ===================================================================
 * SF Lecture One 테마 - 강의 관련 페이지 공용 UI 스크립트
 * -------------------------------------------------------------------
 * 이 파일은 아래 페이지들에서 공통으로 사용되는 UI 동작을 제어합니다.
 * - 강의 목록 (archive-sf_lto_lecture.php)
 * - 강의/챕터 상세 (single-lecture.php)
 * - 검색 결과 (search.php)
 *
 * 각 기능은 필요한 HTML 요소가 현재 페이지에 존재할 경우에만 활성화됩니다.
 * ===================================================================
 */

// 문서(DOM)가 완전히 로드된 후 스크립트를 실행합니다.
document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // --- 1. GNB 모바일 오버레이 메뉴 로직 ---
  // (header-archive-lecture.php를 사용하는 페이지에만 존재)
  const mobileMenuToggle = document.getElementById("sf-lto-mobile-menu-toggle");
  const mobileMenuClose = document.getElementById("sf-lto-mobile-menu-close");
  const mobileMenuOverlay = document.getElementById(
    "sf-lto-mobile-menu-overlay"
  );

  // 필요한 모든 요소가 현재 페이지에 존재할 때만 이벤트를 등록합니다.
  if (mobileMenuToggle && mobileMenuOverlay && mobileMenuClose) {
    // 열기(햄버거) 버튼 클릭 시
    mobileMenuToggle.addEventListener("click", function () {
      mobileMenuOverlay.classList.add("is-open");
      document.body.classList.add("mobile-menu-is-open"); // 배경 페이지 스크롤 방지
    });

    // 닫기(X) 버튼 클릭 시
    mobileMenuClose.addEventListener("click", function () {
      mobileMenuOverlay.classList.remove("is-open");
      document.body.classList.remove("mobile-menu-is-open");
    });
  }

  // --- 2. 강의/챕터 상세 페이지 사이드바 토글 로직 (LocalStorage 연동) ---
  // (single-lecture.php 에만 존재)
  const sidebarToggleButton = document.getElementById("sf-lto-sidebar-toggle");
  const container = document.querySelector(".sf-lt-one-lecture-container");

  if (sidebarToggleButton && container) {
    // 페이지 로드 시, 브라우저의 로컬 스토리지에 저장된 상태를 확인하고 복원합니다.
    // 이를 통해 사용자의 선택(사이드바 열림/닫힘)이 세션 간에 유지됩니다.
    const savedState = localStorage.getItem("sfLtoSidebarState");
    if (savedState === "hidden") {
      container.classList.add("sidebar-hidden");
    }

    // 토글 버튼 클릭 시
    sidebarToggleButton.addEventListener("click", function () {
      container.classList.toggle("sidebar-hidden");

      // 변경된 상태를 로컬 스토리지에 저장합니다.
      if (container.classList.contains("sidebar-hidden")) {
        localStorage.setItem("sfLtoSidebarState", "hidden");
      } else {
        localStorage.setItem("sfLtoSidebarState", "visible");
      }
    });
  }

  // --- 3. 공용 검색 모달 UI 로직 ---
  // (이 스크립트가 로드되는 모든 페이지에 존재)
  const searchToggleButton = document.getElementById("sf-lto-search-toggle");
  const searchModal = document.getElementById("sf-lto-search-modal");
  const searchOverlay = document.getElementById("sf-lto-search-overlay");
  const searchCloseButton = document.getElementById("sf-lto-search-close");
  const searchInputField = document.querySelector(".sf-lt-one-search-field");

  if (searchToggleButton && searchModal && searchOverlay && searchCloseButton) {
    // 검색 버튼 클릭 시 모달 열기
    searchToggleButton.addEventListener("click", () => {
      searchModal.classList.add("is-active");
      // 모달이 열리면 검색 입력 필드에 자동으로 포커스
      if (searchInputField) {
        setTimeout(() => searchInputField.focus(), 100); // transition 효과를 위해 약간의 지연
      }
    });

    // 오버레이 클릭 시 모달 닫기
    searchOverlay.addEventListener("click", () =>
      searchModal.classList.remove("is-active")
    );

    // 닫기 버튼(X) 클릭 시 모달 닫기
    searchCloseButton.addEventListener("click", () =>
      searchModal.classList.remove("is-active")
    );

    // ESC 키를 눌렀을 때 모달 닫기
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        searchModal.classList.contains("is-active")
      ) {
        searchModal.classList.remove("is-active");
      }
    });
  }

  // --- 4. SNS 공유 (링크 복사) 기능 ---
  // (header-archive-lecture.php를 사용하는 페이지에만 존재)
  const shareButton = document.getElementById("sf-lto-share-button");
  if (shareButton) {
    shareButton.addEventListener("click", function () {
      // navigator.clipboard.writeText는 최신 브라우저에서 지원하는 보안 복사 기능입니다.
      navigator.clipboard.writeText(window.location.href).then(
        function () {
          // functions.php에서 wp_localize_script로 전달받은 메시지가 있는지 확인하고 사용합니다.
          if (typeof sfLtoPublic !== "undefined" && sfLtoPublic.shareAlertMsg) {
            alert(sfLtoPublic.shareAlertMsg);
          } else {
            alert("링크가 복사되었습니다."); // Fallback 메시지
          }
        },
        function (err) {
          alert("링크 복사에 실패했습니다.");
          console.error("Failed to copy link: ", err);
        }
      );
    });
  }
});
