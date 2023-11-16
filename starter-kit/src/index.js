import Horos from "horos";
import Turso from "horos/turso";
import Supabase from "horos/supabase";
import { getCookie } from "horos/cookies";
import React from "react";
import keys from "@/keys.js";

const app = new Horos({ basePath: "/" });

// Middleware applied to every route. Logs and adds user info to context
app.use("*", (req, context, next) => {
  console.log("Global middleware");
  // Handling CORS preflight requests
  if (req.method.toUpperCase() === "OPTIONS") {
    return new Response("CORS preflight response");
  }

  // Mock user data added to context for demonstration purposes
  context.user = { name: "horos", id: 1 };
  return next();
});

// Route returning context.user data
app.get("/", async (request, context) => {
  const { Welcome } = await import("@/views/welcome");
  return app.render(Welcome);
});

// Route returning context.user data
app.get("/context", async (request, context) => {
  return new Response(JSON.stringify(context.user));
});

// Middleware for specific route. Logs only if request ends with 'turso'
app.use("*", async (req, context, next) => {
  if (req.url.endsWith("turso")) {
    console.log("turso-specific middleware");
    return next();
  }
  return next();
});

// Route using Turso to execute a database query
app.get("/turso", async (request, context) => {
  const turso = new Turso(keys.turso);
  const rs = await turso.execute("SELECT * FROM users"); // replace 'users'
  return new Response(JSON.stringify(rs));
});

// Route returning all cookies
app.get("/cookies", async (request, context) => {
  const cookies = getCookie(request);
  return new Response(JSON.stringify(cookies));
});

// Route using Supabase to fetch data from table
app.get("/supabase", async (request, context) => {
  const supabase = new Supabase(keys.supabase);
  const { data, error } = await supabase.from("YOUR_TABLE_NAME").select("*"); // replace YOUR_TABLE_NAME
  return new Response(JSON.stringify(data));
});

// Route with regex path parameter, redirects to an image URL
app.get("/musico/:zappa{.+.png$}", async (request, context) => {
  return app.redirect(
    "https://upload.wikimedia.org/wikipedia/commons/c/c4/Zappa_16011977_01_300.jpg"
  );
});

// Route demonstrating use of path and query parameters
app.get("/pagina/:id", async (request, context) => {
  const userId = request.params.id;
  const sortBy = request.query.sort;
  const html = `
    <html>
      <body>
        <h1>User ID: ${userId}</h1>
        <p>Sort By: ${sortBy}</p>
      </body>
    </html>`;
  return app.render(html);
});

// Route demonstrating JSX rendering
app.get("/jsx", async (request, context) => {
  function formatName(user) {
    return user.firstName + " " + user.lastName;
  }
  const user = { firstName: "Bilbo", lastName: "Bolseiro" };
  const element = `<h1> Hello, ${formatName(user)}! </h1>`;
  return app.render(element);
});

// Route for getting and deleting cookies
app.get("/cookies", async (request, context) => {
  const cookieName = request.query.name;
  const cookies = request.getCookie(cookieName);
  let response = new Response(JSON.stringify(cookies));
  response = deleteCookie(response, { name: "horos" });
  return response;
});

// Route to list all app routes
app.get("/app-routes", async (request, context) => {
  const routes = app.getRoutes();
  return new Response(JSON.stringify(routes));
});

// Custom 404 Not Found handler
app.onNotFound((err) => {
  const html = `<h1>404 Not Found</h1>`;
  return app.render(html);
});

// Custom Error handler for the route '/broke'
app.get("/broke", async (request, context) => {
  throw new Error("custom error message");
});

// Global error handler
app.onError((err) => {
  console.log("Global Error Handler:", err);
});

app.listen("fetch"); // Starts the Horos app
