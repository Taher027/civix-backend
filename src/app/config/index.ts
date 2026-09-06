import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });
export default {
	node_env: process.env.NODE_ENV,
	port: process.env.PORT,
	app_url: process.env.APP_URL,
	bcrypt_salt_round: process.env.BCRYPT_SALT_ROUNDS,
	jwt_access_token_secret: process.env.JWT_ACCESS_SECRET!,
	jwt_refresh_token_secret: process.env.JWT_REFRESH_SECRET!,
	jwt_access_token_expireIn: process.env.JWT_ACCESS_EXPIRES_IN!,
	jwt_refresh_token_expireIn: process.env.JWT_REFRESH_EXPIRES_IN!,

	backend_url: process.env.BACKEND_URL!,
	frontend_url: process.env.FRONTEND_URL!,

	cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
	cloudinary_api_key: process.env.CLOUDINARY_API_KEY!,
	cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET!,
};
