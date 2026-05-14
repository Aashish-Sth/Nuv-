(async () => {
  try {
    const base = "http://localhost:3002";

    const loginRes = await fetch(base + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@nuve.com", password: "Admin123" }),
    });
    const loginJson = await loginRes.json();
    console.log("LOGIN:", JSON.stringify(loginJson, null, 2));

    const token = loginJson?.data?.accessToken;
    if (!token) {
      console.error("No token returned");
      process.exit(1);
    }

    const restaurantsRes = await fetch(base + "/api/restaurants");
    const restaurantsJson = await restaurantsRes.json();
    console.log("RESTAURANTS:", JSON.stringify(restaurantsJson, null, 2));

    const rid = restaurantsJson?.data?.items?.[0]?.id;
    if (!rid) {
      console.error("No restaurants found");
      process.exit(1);
    }

    const createRes = await fetch(`${base}/api/restaurants/${rid}/menu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: "CLI Test Dish",
        price: 7.5,
        description: "Created via CLI script",
        category: "Test",
        image: null,
      }),
    });

    const createJson = await createRes.json();
    console.log("CREATE:", JSON.stringify(createJson, null, 2));

    const menuRes = await fetch(`${base}/api/restaurants/${rid}/menu`);
    const menuJson = await menuRes.json();
    console.log("MENU:", JSON.stringify(menuJson, null, 2));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
