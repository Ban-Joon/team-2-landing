// reserve.js
document.addEventListener('DOMContentLoaded', () => {
  // ───────────────────────────────────────────
  // 1. DOM 요소 참조
  const steps             = document.querySelectorAll('.step-bar__item');
  const sections          = document.querySelectorAll('.step-section');
  const prevBtn           = document.getElementById('prevBtn');
  const nextBtn           = document.getElementById('nextBtn');
  const addressSearchBtn  = document.getElementById('addressSearchBtn');
  const popup             = document.getElementById('postcodePopup');
  const container         = document.getElementById('postcodeContainer');
  const closeBtn          = document.getElementById('postcodeCloseBtn');
  let   currentStep       = 1;

  // ───────────────────────────────────────────
  // 2. 스텝바 & 섹션 토글 함수
  function setActive(step) {
    steps.forEach(item => {
      item.classList.toggle('step-bar__item--active',
        Number(item.dataset.step) === step);
    });
    sections.forEach(sec => {
      sec.classList.toggle('active',
        Number(sec.id.split('-')[1]) === step);
    });
    prevBtn.disabled    = step === 1;
    nextBtn.textContent = step === 4 ? '완료' : '다음';
    // 활성 스탭을 가로 스크롤 중앙에 오도록 스크롤
    const activeItem = document.querySelector(`.step-bar__item[data-step="${step}"]`);
    if (activeItem) {
    activeItem.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
  }

  // ───────────────────────────────────────────
  // 3. 팝업 닫기 버튼 이벤트
  closeBtn.addEventListener('click', () => {
    popup.style.display = 'none';
  });

  // ───────────────────────────────────────────
  // 4. 주소 검색 클릭 핸들러 (Daum Postcode)
  addressSearchBtn.addEventListener('click', () => {
    container.innerHTML   = '';          // 이전 위젯 제거
    popup.style.display   = 'block';     // 팝업 보이기
    new daum.Postcode({                // 위젯 embed
      width: '100%', height: '100%',
      oncomplete(data) {
        console.log('oncomplete 호출됨', data);
        document.getElementById('postcodeInput').value     = data.zonecode;
        document.getElementById('roadAddressInput').value  = data.roadAddress;
        popup.style.display = 'none';
      },
      onclose() {
        popup.style.display = 'none';
      }
    }).embed(container);
  });

  // ───────────────────────────────────────────
  // 5. 단계별 유효성 검사
  function validateStep1() {
    const isOver  = document.getElementById('ageOver').checked;
    const isUnder = document.getElementById('ageUnder').checked;
    const isAgree = document.getElementById('agreeCheckbox').checked;
    if ((!isOver && !isUnder) || !isAgree) {
      alert('연령 확인 및 약관 동의가 필요합니다.');
      return false;
    }
    return true;
  }

  function validateStep2() {
    const noticeChecked = document.getElementById('itemNoticeCheckbox').checked;
    if (selected.length < 1) {
      alert('하나 이상의 품목을 선택해 주세요.');
      return false;
    }
    if (!noticeChecked) {
      alert('안내 사항 확인이 필요합니다.');
      return false;
    }
    return true;
  }

  function validateStep3() {
    const form = document.getElementById('form-step-3');
    if (!form.checkValidity()) {
      alert('모든 필수 항목을 입력해 주세요.');
      return false;
    }
    return true;
  }

  function validateStep4() {
    const sms   = document.getElementById('notifySms').checked;
    const kakao = document.getElementById('notifyKakao').checked;
    if (!sms && !kakao) {
      alert('알림 채널을 하나 이상 선택해 주세요.');
      return false;
    }
    return true;
  }

  // ───────────────────────────────────────────
  // 6. 배출 품목 데이터 및 로직
  const data = {
    fridge: {
      name: '냉장고', icon: 'assets/icons/fridge.svg',
      mediums: {
        large: {
          name: '대형',
          minors: [
            { name: '양문형냉장고', icon: 'assets/icons/large-double-door.svg' },
            { name: '김치냉장고',   icon: 'assets/icons/kimchi-fridge.svg' },
            { name: '업소용냉장고',  icon: 'assets/icons/commercial-fridge.svg' }
          ]
        },
        small: {
          name: '중형',
          minors: [
            { name: '와인냉장고',   icon: 'assets/icons/wine-fridge.svg' },
            { name: '가정용냉장고', icon: 'assets/icons/home-fridge.svg' },
            { name: '쇼케이스',     icon: 'assets/icons/showcase.svg' }
          ]
        }
      }
    },
    washer: {
      name: '세탁기', icon: 'assets/icons/washer.svg',
      mediums: {
        normal: { name: '일반', minors: [{ name: '일반세탁기', icon: 'assets/icons/washer-normal.svg' }] },
        drum:   { name: '드럼', minors: [{ name: '드럼세탁기', icon: 'assets/icons/washer-drum.svg' }] },
        dewater:{ name: '탈수기', minors: [{ name: '탈수기', icon: 'assets/icons/dewater.svg' }] }
      }
    },
    etc: { name: '기타', icon: 'assets/icons/etc.svg', mediums: { etc: { name: '기타', minors: [{ name: '기타', icon: 'assets/icons/etc.svg' }] } } }
  };
  let selected = [];

  // DOM 참조 (배출 품목 영역)
  const majorList  = document.getElementById('majorList');
  const mediumList = document.getElementById('mediumList');
  const minorList  = document.getElementById('minorList');

  // 6-1) 대분류 버튼 생성
  Object.entries(data).forEach(([key, { name, icon }]) => {
    majorList.insertAdjacentHTML('beforeend', `
      <button class="btn btn-outline-secondary d-flex flex-column align-items-center"
              data-major="${key}" style="width:4.5rem;padding:0.5rem">
        <img src="${icon}" alt="${name} 아이콘" width="32" class="mb-1">
        <span>${name}</span>
      </button>`);
  });

  // 6-2) 대분류 클릭 → 중분류 버튼 생성
  majorList.addEventListener('click', e => {
    const maj = e.target.closest('button')?.dataset.major;
    if (!maj) return;
    mediumList.innerHTML = '';
    Object.entries(data[maj].mediums).forEach(([mKey, { name }]) => {
      mediumList.insertAdjacentHTML('beforeend', `
        <button class="btn btn-outline-secondary"
                data-major="${maj}" data-medium="${mKey}">
          ${name}
        </button>`);
    });
  });

  // 6-3) 중분류 클릭 → 소분류 모달
  mediumList.addEventListener('click', e => {
    const btn = e.target.closest('button');
    const maj = btn.dataset.major;
    const med = btn.dataset.medium;
    minorList.innerHTML = '';
    data[maj].mediums[med].minors.forEach(({ name, icon }) => {
      minorList.insertAdjacentHTML('beforeend', `
        <button class="btn btn-outline-secondary d-flex flex-column align-items-center"
                data-major="${maj}" data-medium="${med}" data-minor="${name}"
                style="width:4.5rem;padding:0.5rem">
          <img src="${icon}" alt="${name} 아이콘" width="32" class="mb-1">
          <span>${name}</span>
        </button>`);
    });
    new bootstrap.Modal(document.getElementById('minorModal')).show();
  });

  // 6-4) 소분류 선택 → 테이블 갱신
  minorList.addEventListener('click', e => {
    const btn = e.target.closest('button');
    const { major: maj, medium: med, minor: min } = btn.dataset;
    const exist = selected.find(i => i.major===maj&&i.medium===med&&i.minor===min);
    if (exist) exist.qty++;
    else selected.push({ major:maj, medium:med, minor:min, qty:1 });
    updateTable();
    bootstrap.Modal.getInstance(document.getElementById('minorModal')).hide();
  });

  // 6-5) 선택 테이블 갱신 함수
  function updateTable() {
    const tbody = document.getElementById('selectedItems');
    tbody.innerHTML = '';
    selected.forEach((item, idx) => {
      const { name: majName } = data[item.major];
      const { name: medName } = data[item.major].mediums[item.medium];
      tbody.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${majName}</td><td>${medName}</td><td>${item.minor}</td>
          <td>
            <button class="btn btn-sm btn-outline-secondary" onclick="changeQty(${idx},-1)">-</button>
            ${item.qty}
            <button class="btn btn-sm btn-outline-secondary" onclick="changeQty(${idx},1)">+</button>
          </td>
          <td><button class="btn btn-sm btn-danger" onclick="removeItem(${idx})">삭제</button></td>
        </tr>`);
    });
  }
  window.changeQty = (i,d)=>{ selected[i].qty=Math.max(1,selected[i].qty+d); updateTable(); };
  window.removeItem = i=>{ selected.splice(i,1); updateTable(); };

  // ───────────────────────────────────────────
  // 7. 4단계 요약 생성
  function populateSummary() {
    const tbody = document.getElementById('itemSummary');
    tbody.innerHTML = '';
    selected.forEach(item=>{
      if(item.qty>0) {
        tbody.insertAdjacentHTML('beforeend',
          `<tr><td>${item.minor}</td><td>${item.qty}</td></tr>`);
      }
    });
    const infoList = document.getElementById('infoSummary');
    infoList.innerHTML = '';
    const fields = [
      ['이름', document.getElementById('nameInput').value],
      ['휴대폰', document.getElementById('mobileInput').value],
      ['일반전화', document.getElementById('phoneInput').value||'–'],
      ['주소', `${document.getElementById('roadAddressInput').value} ${document.getElementById('detailAddressInput').value}`],
      ['주거 형태', document.getElementById('residenceSelect').selectedOptions[0].text],
      ['엘리베이터', document.getElementById('elevatorSwitch').checked?'있음':'없음'],
      ['희망일', document.getElementById('dateInput').value]
    ];
    fields.forEach(([label,val])=>{
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.textContent = `${label}: ${val}`;
      infoList.appendChild(li);
    });
  }

  // ───────────────────────────────────────────
  // 8. Prev/Next 버튼 핸들러
  nextBtn.addEventListener('click', () => {
    const validators = [null, validateStep1, validateStep2, validateStep3, validateStep4];
    if (validators[currentStep] && !validators[currentStep]()) return;
    if (currentStep < 4) {
      currentStep++;
      setActive(currentStep);
      if (currentStep === 4) populateSummary();
    } else {
      // 최종 처리(API 호출 등)
    }
  });
  prevBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      setActive(currentStep);
    }
  });

  // ───────────────────────────────────────────
  // 9. 날짜 선택기 초기화 (Flatpickr)
  flatpickr('#dateInput', {
    locale: 'ko',
    dateFormat: 'Y-m-d',
    minDate: 'today',
    allowInput: true,
    disableMobile: true
  });

  // ───────────────────────────────────────────
  // 초기 렌더링
  setActive(currentStep);
});
