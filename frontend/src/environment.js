let IS_PROD = true;
const server = IS_PROD?
   "https://meetflowbackend.onrender.com": "http://localhost:8000"
// const server = {
//     dev:"http://localhost:8000",
//     prod:"https://meetflowbackend.onrender.com"
// }
// export default server;