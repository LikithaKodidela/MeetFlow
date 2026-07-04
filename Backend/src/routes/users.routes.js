import { Router } from "express";
// Router is a feature of Express that lets you create modular API routes.
import { addToHistory, getUserHistory, login, register, deleteFromHistory } from "../controllers/user.controller.js"
const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/add_to_activity").post(addToHistory);
router.route("/get_all_activity").get(getUserHistory);
router.route("/delete_activity").delete(deleteFromHistory);

export default router;