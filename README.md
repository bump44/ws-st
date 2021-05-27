`
fetch('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ username: 'bump44', password: 'test' }),
  headers: {
    'Content-Type': 'application/json',
  },
});

fetch('/auth/register', {
  method: 'POST',
  body: JSON.stringify({ username: 'bump44', password: 'test' }),
  headers: {
    'Content-Type': 'application/json',
  },
});
`