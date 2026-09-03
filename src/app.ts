import cookieParser from "cookie-parser";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import config from "./app/config";
import cors from "cors";
import notFound from "./app/middleware/notFound";
const app: Application = express();
app.use(
	cors({
		origin: config.app_url,
		credentials: true,
	}),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
	res.send("Hello, World!");
});

app.use(notFound);

export default app;
