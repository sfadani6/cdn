/**
 * ===================================================================
 * SF Lecture One 테마 - 관리자 전용 스크립트
 * -------------------------------------------------------------------
 * 이 스크립트는 '챕터' CPT 편집 화면에서 관리자의 편의성을 높이기 위한
 * 자동화 기능을 제공합니다.
 *
 * 로드 위치: inc/assets-admin.php
 * 적용 페이지: '챕터' CPT의 '새로 추가(post-new.php)' 및 '편집(post.php)' 화면
 * ===================================================================
 */
(function ($) {
  "use strict";

  // 문서(DOM)가 완전히 로드된 후 스크립트를 실행합니다.
  $(document).ready(function () {
    // --- 1. 필요한 HTML 요소들을 변수에 할당 ---
    var $parentLectureSelect = $("#sf_lto_parent_lecture"); // '소속 강의' 드롭다운
    var $chapterOrderInput = $("#sf_lto_chapter_order"); // '챕터 순서' 입력 필드
    var $tagsInput = $("#new-tag-post_tag"); // '태그' 입력 필드

    /**
     * '소속 강의' 드롭다운의 값이 변경될 때 실행되는 메인 함수
     */
    function onLectureChange() {
      // 선택된 강의의 ID를 가져옵니다. 선택된 값이 없으면 함수를 종료합니다.
      var lectureId = $parentLectureSelect.val();
      if (!lectureId) return;

      // --- 2. 챕터 순서 자동 채우기 (AJAX) ---
      // '챕터 순서' 입력 필드가 비어 있을 때만 실행하여, 사용자가 수동으로 입력한 값을 덮어쓰지 않도록 합니다.
      if (!$chapterOrderInput.val()) {
        $.ajax({
          url: sfLtoAdmin.ajaxurl, // functions.php에서 wp_localize_script로 전달받은 AJAX URL
          type: "POST",
          data: {
            action: "sf_lto_get_next_chapter_order", // 서버(meta.php)에서 이 action을 처리할 함수를 찾음
            nonce: sfLtoAdmin.orderNonce, // 보안 검증을 위한 Nonce 토큰
            lecture_id: lectureId, // 선택된 강의 ID를 서버로 전송
          },
          success: function (response) {
            // AJAX 요청이 성공하고, 서버가 성공 응답(success: true)을 보냈을 때 실행
            if (response.success) {
              // 응답받은 다음 순서(next_order) 값을 '챕터 순서' 필드에 입력
              $chapterOrderInput.val(response.data.next_order);
            }
          },
          error: function (xhr, status, error) {
            // AJAX 요청 실패 시 콘솔에 에러를 기록
            console.error(
              "AJAX Error (Get Next Chapter Order):",
              status,
              error
            );
          },
        });
      }

      // --- 3. 태그 자동 채우기 (AJAX) ---
      // 이 기능은 오직 '새 글 작성' 페이지일 때만 실행합니다.
      // (포스트 ID가 없거나 '0'일 경우 새 글 작성 페이지로 간주)
      if (!$("input#post_ID").val() || $("input#post_ID").val() === "0") {
        $.ajax({
          url: sfLtoAdmin.ajaxurl,
          type: "POST",
          data: {
            action: "sf_lto_get_lecture_tags", // 서버(meta.php)에서 이 action을 처리할 함수를 찾음
            nonce: sfLtoAdmin.tagsNonce, // 보안 검증을 위한 Nonce 토큰
            lecture_id: lectureId, // 선택된 강의 ID를 서버로 전송
          },
          success: function (response) {
            // 서버로부터 성공 응답을 받고, 태그 데이터가 존재할 경우
            if (response.success && response.data.tags) {
              // 1. 응답받은 태그 문자열(예: "PHP, 워드프레스")을 태그 입력 필드에 넣습니다.
              $tagsInput.val(response.data.tags);
              // 2. [매우 중요] 워드프레스 태그 UI의 '추가' 버튼을 프로그래밍적으로 클릭합니다.
              //    이 과정을 거쳐야 입력된 태그 문자열이 실제 태그 박스에 추가됩니다.
              $("#post_tag .tagadd").trigger("click");
            }
          },
          error: function (xhr, status, error) {
            console.error("AJAX Error (Get Lecture Tags):", status, error);
          },
        });
      }
    }

    // --- 4. 이벤트 핸들러 등록 ---
    // '소속 강의' 드롭다운의 값이 변경(change)될 때마다 onLectureChange 함수를 실행하도록 이벤트를 등록합니다.
    $parentLectureSelect.on("change", onLectureChange);

    // [보너스] 페이지가 로드되었을 때 이미 '소속 강의'가 선택되어 있는 경우 (예: 유효성 검사 실패 후)
    // '새 글 작성' 페이지에 한해서 onLectureChange 함수를 한 번 실행하여 자동 채우기 기능을 활성화합니다.
    if (
      $parentLectureSelect.val() &&
      (!$("input#post_ID").val() || $("input#post_ID").val() === "0")
    ) {
      onLectureChange();
    }
  });
})(jQuery);
