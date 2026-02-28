// Small helper to test login endpoint from the same machine
async function main() {
  const res = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'password123',
    }),
  });
  console.log('status:', res.status);
  const text = await res.text();
  console.log('body:', text);
}

main().catch((e) => {
  console.error('debug-login error', e);
  process.exit(1);
});

