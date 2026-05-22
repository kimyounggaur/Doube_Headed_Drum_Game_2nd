import { chromium } from 'playwright';

const baseUrl = process.env.UI_CHECK_URL ?? 'http://127.0.0.1:5173/';
const failures = [];
const actions = [];

function record(name) {
  actions.push(name);
}

function fail(name, error) {
  failures.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
}

async function safe(name, fn) {
  try {
    await fn();
    record(name);
  } catch (error) {
    fail(name, error);
  }
}

async function expectText(page, text) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible', timeout: 5000 });
}

async function clickFirst(page, role, name) {
  const locator = page.getByRole(role, { name });
  const count = await locator.count();
  if (count < 1) {
    throw new Error(`No ${role} named ${name}`);
  }
  await locator.first().click();
}

async function setRange(page, index, value) {
  const range = page.locator('input[type="range"]').nth(index);
  await range.evaluate(
    (node, nextValue) => {
      const input = node;
      input.value = String(nextValue);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    },
    value,
  );
}

async function unlockAll(page) {
  await page.evaluate(() => {
    localStorage.setItem(
      'joseon-drum-commander:progress',
      JSON.stringify({
        version: 2,
        xp: 1200,
        completedLevels: ['busanjin', 'night-watch', 'waegu-ambush', 'hansando', 'haengju'],
        unlockedLevels: ['busanjin', 'night-watch', 'waegu-ambush', 'hansando', 'haengju'],
        unlockedFormations: ['iljajin', 'hakyikjin', 'jangsajin', 'wonjin'],
        unlockedEquipment: ['training-janggu', 'cheollik', 'bamboo-stick', 'yonggo', 'singijeon-drum', 'dujeonggap', 'horn-stick'],
        equipped: { drum: 'training-janggu', robe: 'cheollik', stick: 'bamboo-stick' },
        bestGrades: {},
      }),
    );
  });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const consoleErrors = [];
page.on('console', (message) => {
  if (message.type() === 'error') {
    consoleErrors.push(message.text());
  }
});
page.on('pageerror', (error) => {
  consoleErrors.push(error.message);
});

await safe('앱 로드', async () => {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await unlockAll(page);
  await page.reload({ waitUntil: 'networkidle' });
  await expectText(page, '조선의 북소리');
});

await safe('설정 버튼 및 슬라이더/체크박스', async () => {
  await clickFirst(page, 'button', '설정');
  await expectText(page, '입력과 사운드');
  const rangeCount = await page.locator('input[type="range"]').count();
  if (rangeCount < 4) {
    throw new Error(`Expected at least 4 sliders, found ${rangeCount}`);
  }
  await setRange(page, 0, 25);
  await setRange(page, 1, 1.15);
  await setRange(page, 2, 1.2);
  await setRange(page, 3, 0.4);
  const checkboxCount = await page.locator('input[type="checkbox"]').count();
  if (checkboxCount < 2) {
    throw new Error(`Expected at least 2 toggles, found ${checkboxCount}`);
  }
  await page.locator('input[type="checkbox"]').first().check();
  await page.locator('input[type="checkbox"]').first().uncheck();
  await page.locator('input[type="checkbox"]').nth(1).check();
  await clickFirst(page, 'button', '기본값');
  await clickFirst(page, 'button', '돌아가기');
  await expectText(page, '전장의 지휘자');
});

await safe('장비 화면의 장착 버튼', async () => {
  await clickFirst(page, 'button', '장비 관리');
  await expectText(page, '승진과 장비');
  const equipButtons = page.getByRole('button', { name: '장착' });
  const count = await equipButtons.count();
  if (count < 3) {
    throw new Error(`Expected several equip buttons, found ${count}`);
  }
  await equipButtons.first().click();
  await clickFirst(page, 'button', '돌아가기');
  await expectText(page, '전장의 지휘자');
});

await safe('도감 버튼 및 연습 진입', async () => {
  await clickFirst(page, 'button', '도감 열기');
  await expectText(page, '군령과 장단');
  const practice = page.getByRole('button', { name: '연습' });
  if ((await practice.count()) < 1) {
    throw new Error('No practice buttons found');
  }
  await practice.first().click();
  await expectText(page, '북채를 들어 군령을 시작하세요');
  await clickFirst(page, 'button', '나가기');
});

await safe('훈련 듣기 모달과 전투 입력 버튼/키보드', async () => {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await clickFirst(page, 'button', '훈련');
  await expectText(page, '장단 훈련');
  await page.getByRole('button', { name: '듣기' }).first().click();
  await expectText(page, '듣기 모드');
  await clickFirst(page, 'button', '닫기');
  await page.getByRole('button', { name: '따라치기' }).first().click();
  await expectText(page, '북채를 들어 군령을 시작하세요');
  await clickFirst(page, 'button', '전투 시작');
  for (const label of ['구', '궁', '더', '덩', '따', '다']) {
    await page.getByRole('button', { name: label }).first().click();
  }
  for (const key of ['F', 'D', 'J', 'K', 'Space', 'Enter']) {
    await page.keyboard.press(key);
  }
  await clickFirst(page, 'button', '나가기');
});

await safe('캠페인 5개 시작 버튼', async () => {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await unlockAll(page);
  await page.reload({ waitUntil: 'networkidle' });
  await clickFirst(page, 'button', '캠페인');
  await expectText(page, '역사 속 전장');
  const starts = page.getByRole('button', { name: '시작' });
  const startCount = await starts.count();
  if (startCount < 5) {
    throw new Error(`Expected 5 campaign start buttons, found ${startCount}`);
  }
  for (let index = 0; index < startCount; index += 1) {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await unlockAll(page);
    await page.reload({ waitUntil: 'networkidle' });
    await clickFirst(page, 'button', '캠페인');
    await page.getByRole('button', { name: '시작' }).nth(index).click();
    await expectText(page, '북채를 들어 군령을 시작하세요');
    await clickFirst(page, 'button', '나가기');
  }
});

await safe('모바일 뷰 터치 영역', async () => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await unlockAll(page);
  await page.reload({ waitUntil: 'networkidle' });
  await clickFirst(page, 'button', '훈련');
  await page.getByRole('button', { name: '실전 적용' }).first().click();
  await clickFirst(page, 'button', '전투 시작');
  const drumButtons = ['구', '궁', '더', '덩', '따', '다'];
  for (const label of drumButtons) {
    const button = page.getByRole('button', { name: label }).first();
    const box = await button.boundingBox();
    if (!box || box.width < 64 || box.height < 64) {
      throw new Error(`${label} touch target too small: ${box?.width}x${box?.height}`);
    }
    await button.click();
  }
});

await browser.close();

if (consoleErrors.length > 0) {
  failures.push(`console/page errors: ${consoleErrors.join(' | ')}`);
}

console.log(JSON.stringify({ baseUrl, passed: failures.length === 0, actions, failures }, null, 2));
process.exitCode = failures.length === 0 ? 0 : 1;
