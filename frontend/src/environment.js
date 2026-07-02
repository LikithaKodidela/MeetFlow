// Automatically uses production backend when built with `npm run build`
// (React sets NODE_ENV="production" during build)
const server = process.env.NODE_ENV === "production"
  ? "https://meetflowbackend.onrender.com"
  : "http://localhost:8000";

export default server;