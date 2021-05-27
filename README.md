```
fetch('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ username: 'bump44', password: 'test' }),
  headers: {
    'Content-Type': 'application/json',
  },
});
```

```
fetch('/auth/register', {
  method: 'POST',
  body: JSON.stringify({ username: 'bump44', password: 'test' }),
  headers: {
    'Content-Type': 'application/json',
  },
});
```

```
(async () => {
  const [value1, value2, value3, value4] = await Promise.all([
    new Promise((res) => setTimeout(() => res(1), 500)),
    new Promise((res) => setTimeout(() => res(2), 100)),
    new Promise((res) => setTimeout(() => res(3), 300)),
    new Promise((res) => setTimeout(() => res(4), 15000)),
  ]);

  console.log(value1, value2, value3, value4);
})();
```
