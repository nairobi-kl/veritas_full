const API_URL = 'http://localhost:8021';

export async function createTest(testData: any, token: string) {
  const res = await fetch(`${API_URL}/tests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: testData.title,
      subject: testData.subject,
      time_limit_min: testData.timeLimit,
      created_by: testData.teacherId || 1,
      max_score: testData.questions.reduce((a: number, q: any) => a + q.points, 0),
      group_ids: testData.groups,
      questions: testData.questions,
    }),
  });
  return res.json();
}

export async function getTeacherTests(teacherId: number, token: string) {
  const res = await fetch(`http://localhost:8021/tests/${teacherId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Помилка: ${res.status}`);
  return res.json();
}

export async function getAvailableTests(groupId: number, token: string) {
  const res = await fetch(`http://localhost:8021/student/tests/${groupId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Помилка: ${res.status}`);
  return res.json();
}

export async function getTestQuestions(testId: number, token: string) {
  const res = await fetch(`${API_URL}/student/test/${testId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getGroups(token: string) {
  const res = await fetch(`${API_URL}/groups`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    console.error(`❌ Помилка отримання груп: ${res.status}`);
    throw new Error(`Помилка отримання груп (${res.status})`);
  }

  return res.json();
}

// api.ts
export async function submitTestResults(data: any, token: string) {
  const res = await fetch(`${API_URL}/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

