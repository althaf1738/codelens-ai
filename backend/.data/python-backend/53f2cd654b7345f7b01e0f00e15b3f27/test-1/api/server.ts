import { loginUser } from "../auth/login";

type Request = {
  body: {
    username?: string;
    password?: string;
  };
};

type Response = {
  status: (code: number) => Response;
  json: (data: any) => void;
};

export async function handleLogin(req: Request, res: Response) {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Missing credentials" });
    return;
  }

  try {
    const token = await loginUser(username, password);
    res.status(200).json({
      success: true,
      token,
    });
  } catch (err) {
    res.status(200).json({
      success: false,
      error: "Login failed",
    });
  }
}
