// reserve.js

document.addEventListener('DOMContentLoaded', () => {
  // 1. 요소 선택 및 초기 상태 변수
  const steps = document.querySelectorAll('.step-bar__item');
  const sections = document.querySelectorAll('.step-section');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const addressSearchBtn = document.getElementById('addressSearchBtn');
  let currentStep = 1;

  // 2. 스텝바·섹션·버튼 상태 업데이트 함수
  function setActive(step) {
    // 스텝바 활성화 토글
    steps.forEach(item => {
      const s = Number(item.dataset.step);
      item.classList.toggle('step-bar__item--active', s === step);
    });
    // 섹션 표시 토글
    sections.forEach(sec => {
      const s = Number(sec.id.split('-')[1]);
      sec.classList.toggle('active', s === step);
    });
    // 버튼 상태 업데이트
    prevBtn.disabled = step === 1;
    nextBtn.textContent = step === 4 ? '완료' : '다음';
  }

  // 3. 단계별 유효성 검사 함수 모음
  function validateStep1() {
    const isOver = document.getElementById('ageOver').checked;
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


    //배출품목 입력 작동
// 데이터 정의
const data = {
  fridge: {
    name: '냉장고',
    mediums: {
      large: { name: '대형', minors: ['양문형냉장고', '김치냉장고', '업소용냉장고'] },
      small: { name: '중형', minors: ['와인냉장고', '가정용냉장고', '쇼케이스'] }
    }
  },
  washer: {
    name: '세탁기',
    mediums: {
      normal: { name: '일반', minors: ['일반세탁기'] },
      drum: { name: '드럼', minors: ['드럼세탁기'] },
      dewater: { name: '탈수기', minors: ['탈수기'] }
    }
  },
  etc: {
    name: '기타',
    mediums: { etc: { name: '기타', minors: ['기타'] } }
  }
};

let selected = [];

// 1) 대분류 버튼 생성
const majorList = document.getElementById('majorList');
for (const key in data) {
  majorList.insertAdjacentHTML('beforeend', `
    <button class="btn btn-outline-secondary" data-major="${key}">
      ${data[key].name}
    </button>`);
}

// 2) 대분류 클릭 → 중분류 생성
majorList.addEventListener('click', e => {
  const maj = e.target.dataset.major;
  if (!maj) return;
  const mediums = data[maj].mediums;
  const mediumList = document.getElementById('mediumList');
  mediumList.innerHTML = '';
  for (const mKey in mediums) {
    mediumList.insertAdjacentHTML('beforeend', `
      <button class="btn btn-outline-secondary" 
              data-major="${maj}" data-medium="${mKey}">
        ${mediums[mKey].name}
      </button>`);
  }
});

// 3) 중분류 클릭 → 소분류 모달 열기
mediumList.addEventListener('click', e => {
  const maj = e.target.dataset.major;
  const med = e.target.dataset.medium;
  if (!med) return;
  const minors = data[maj].mediums[med].minors;
  const minorList = document.getElementById('minorList');
  minorList.innerHTML = '';
  minors.forEach(name => {
    minorList.insertAdjacentHTML('beforeend', `
      <button class="btn btn-outline-secondary" 
              data-major="${maj}"
              data-medium="${med}"
              data-minor="${name}">
        ${name}
      </button>`);
  });
  new bootstrap.Modal(document.getElementById('minorModal')).show();
});

// 4) 소분류 선택 → 테이블 추가
document.getElementById('minorList').addEventListener('click', e => {
  const { major, medium, minor } = e.target.dataset;
  if (!minor) return;
  selected.push({ major, medium, minor, qty: 1 });
  updateTable();
  bootstrap.Modal.getInstance(document.getElementById('minorModal')).hide();
});

// 5) 테이블 갱신 함수
function updateTable() {
  const tbody = document.getElementById('selectedItems');
  tbody.innerHTML = '';
  selected.forEach((item, i) => {
    tbody.insertAdjacentHTML('beforeend', `
      <tr>
        <td>${data[item.major].name}</td>
        <td>${data[item.major].mediums[item.medium].name}</td>
        <td>${item.minor}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary" onclick="changeQty(${i}, -1)">-</button>
          ${item.qty}
          <button class="btn btn-sm btn-outline-secondary" onclick="changeQty(${i}, 1)">+</button>
        </td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="removeItem(${i})">삭제</button>
        </td>
      </tr>`);
  });
}

// 수량 변경 및 삭제 함수
window.changeQty = (idx, delta) => {
  selected[idx].qty = Math.max(1, selected[idx].qty + delta);
  updateTable();
};
window.removeItem = idx => {
  selected.splice(idx, 1);
  updateTable();
};


  function validateStep3() {
    const form = document.getElementById('form-step-3');
    if (!form.checkValidity()) {
      alert('모든 필수 항목을 입력해 주세요.');
      return false;
    }
    return true;
  }

  function validateStep4() {
    const sms = document.getElementById('notifySms').checked;
    const kakao = document.getElementById('notifyKakao').checked;
    if (!sms && !kakao) {
      alert('알림 채널을 하나 이상 선택해 주세요.');
      return false;
    }
    return true;
  }

  // 4. 4단계 요약 생성 함수
  function populateSummary() {
    // 품목 요약
    const quantities = document.querySelectorAll('.item-quantity');
    const itemNames = document.querySelectorAll('.item-card span');
    const tbody = document.getElementById('itemSummary');
    tbody.innerHTML = '';
    quantities.forEach((sel, idx) => {
      const qty = Number(sel.value);
      if (qty > 0) {
        const name = itemNames[idx].textContent;
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${name}</td><td>${qty}</td>`;
        tbody.appendChild(tr);
      }
    });

    // 입력 정보 요약
    const infoList = document.getElementById('infoSummary');
    infoList.innerHTML = '';
    const fields = [
      { label: '이름', value: document.getElementById('nameInput').value },
      { label: '휴대폰', value: document.getElementById('mobileInput').value },
      { label: '일반전화', value: document.getElementById('phoneInput').value || '–' },
      {
        label: '주소',
        value: `${document.getElementById('roadAddressInput').value} ${document.getElementById('detailAddressInput').value}`
      },
      {
        label: '주거 형태',
        value: document.getElementById('residenceSelect').selectedOptions[0].text
      },
      {
        label: '엘리베이터',
        value: document.getElementById('elevatorSwitch').checked ? '있음' : '없음'
      },
      { label: '희망일', value: document.getElementById('dateInput').value }
    ];
    fields.forEach(f => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.textContent = `${f.label}: ${f.value}`;
      infoList.appendChild(li);
    });
  }

  // 5. Prev/Next 버튼 이벤트 핸들러
  nextBtn.addEventListener('click', () => {
    // 현재 단계 유효성 검사
    const validators = [null, validateStep1, validateStep2, validateStep3, validateStep4];
    if (validators[currentStep] && !validators[currentStep]()) {
      return;
    }
    // 다음 단계 이동 또는 완료 처리
    if (currentStep < 4) {
      currentStep++;
      setActive(currentStep);
      if (currentStep === 4) {
        populateSummary();
      }
    } else {
      // 최종 예약 API 호출 예시
      const payload = {
        items: Array.from(document.querySelectorAll('.item-quantity'))
          .map((sel, idx) => ({
            name: document.querySelectorAll('.item-card span')[idx].textContent,
            qty: Number(sel.value)
          }))
          .filter(i => i.qty > 0),
        user: {
          name: document.getElementById('nameInput').value,
          mobile: document.getElementById('mobileInput').value,
          phone: document.getElementById('phoneInput').value,
          address: {
            postcode: document.getElementById('postcodeInput').value,
            road: document.getElementById('roadAddressInput').value,
            detail: document.getElementById('detailAddressInput').value
          },
          residence: document.getElementById('residenceSelect').value,
          elevator: document.getElementById('elevatorSwitch').checked,
          date: document.getElementById('dateInput').value,
          notify: {
            sms: document.getElementById('notifySms').checked,
            kakao: document.getElementById('notifyKakao').checked
          }
        }
      };
      fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            window.location.href = '/reserve-success.html';
          } else {
            alert('예약에 실패했습니다. 다시 시도해 주세요.');
          }
        })
        .catch(() => {
          alert('서버와 통신 중 오류가 발생했습니다.');
        });
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      setActive(currentStep);
    }
  });

  // 6. 외부 연동 및 위젯 초기화
  addressSearchBtn.addEventListener('click', () => {
    console.log('우편번호 검색 팝업 호출');
    // 네이버/카카오 우편번호 API 연동 코드 위치
  });
  flatpickr('#dateInput', {
    locale: 'ko',
    dateFormat: 'Y-m-d',
    minDate: 'today'
  });

  // 7. 초기 렌더링
  setActive(currentStep);
});
