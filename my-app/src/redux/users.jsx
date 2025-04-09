const API_URL = "http://localhost:5000/users";

// ✅ Регистрация
export const registerUser = async (data) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Ошибка регистрации");

  return await res.json();
};

// ✅ Авторизация (логин)
export const loginUser = async (data) => {
  const res = await fetch(`${API_URL}?email=${data.email}`);
  const users = await res.json();
  const user = users[0];

  if (!user || user.password !== data.password) {
    throw new Error("Неверный email или пароль");
  }

  const token = "fake-token-" + user.id;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));

  return { user, token };
};

// ✅ Выход
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
